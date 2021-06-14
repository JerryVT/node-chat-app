const socket = io()     // access to socket. allows for sending commuincation from client to server also

// Elements
const $messageForm = document.querySelector('#message-form')       //just as a convention as an element from DOM, $ not required
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML       //for dynamically rendering
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true}) //parsing the query urkl and destructurng to username and room

const autoscroll =() => {           //to handle autoscrtoll off or on
    const $newMessage = $messages.lastElementChild

    // Height of thje new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = $messsages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far I hjave scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if( containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
   // console.log(message);
    const html = Mustache.render(messageTemplate,{       //stores the final html which is going to be rendered
        username: message.username,
        message: message.text,    // here we can give the key value pair
        // the second arg is an object of key value pairs to be passed
        createdAt: moment(message.createdAt).format('h:mm a')      // : is not a token unlike h and mm..so they stay
        
    })
    $messages.insertAdjacentHTML('beforeend', html)        // insertAdjacentHTML allows us to insert other HTML adjacent to the element we've selcted
    autoscroll()
})

socket.on('locationMessage', (url) => {
   // console.log(location_url);
    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        location_url : url.location_url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=> {
    const html = Mustache.redner(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=> {
    e.preventDefault()      //prevent browser to go on default full page refresh

    $messageFormButton.setAttribute('disabled', 'disabled')
    
    //disable
    const message = e.target.elements.message.value       // e is the event
  

    socket.emit('sendMessage', message, (error) => {    //whoever emits the event sets up a callback fn , the one provided after the content to be shared i.e 'message' here
        
        //enable button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error) {
            return console.log(error);
        }    
        console.log('Message Delivered');
    
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position);
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude  
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!');
        })
    })
})


socket.emit('join',{username, room}, (error) => {
        if (error) {
            alert(error)
            location.href = '/'         //redirecting to root folder as error occured
        }
})