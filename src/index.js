const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { addUser, 
        removeUser, 
        getUser, 
        getUsersInRoom
        } = require('./utils/users')

const {generateMessage,
     generateLocationMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)       //creating a new web server and passing express application
const io= socketio(server)
// when we require the library socketio(adding lib) , we get back a fn. WE call that fn to configure socket IO to work with server
// and we pass the server to the fn
// SocketIO expects it to be called with raw http server
// when express creates it behind the scene we cant access it. Hence we have refactored and created the server ourself


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {           // this code runs when a connection is made
    console.log('New Websocket connection')

   // socket.emit('message', generateMessage('Welcome!'))      // sends to the particular connection for which socket is created
   // socket.broadcast.emit('message', generateMessage('A new user has joined')) // sends to all other connected clients except the one which now got connected

    socket.on('join', (options, callback) => {
       
        const {error, user} = addUser({ id: socket.id, ...options})

        if(error) {                 // to handle error
            return callback(error)
        }
        
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))     
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined! `)) 
        io.to('user.room').emit('roomData', {
            room : user.room,
            users: getUsersInRoom(user.room)
        })

   callback()
    })
    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
         const filter = new Filter()

         if(filter.isProfane(message)) {
             return callback('Profanity is not allowed')
         }

        io.to(user.room).emit('message', generateMessage(user.username,message))         // sends to all connected clients including the one which has joined now
        callback('Delivered!')  //whoever receives the emit, receives a callback fn that it needs to call
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {    // these are built in events..so socket.io lib takes care of it
        
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to('user.room').emit('roomData', {
                room : user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
        
    })      
})

server.listen(port, ()=> {                      // unlike in prev proj, we will calling server.listen and not app.listen
    console.log(`Server is up in port ${port}`);
})

