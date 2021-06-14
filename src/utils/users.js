const users =[]

const addUser = ( {id, username, room} ) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store the user
    const user = {id, username, room}
    users.push(user)
    return {user}
}



const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)     // findindex runs only till a match is found

    if(index != -1) {
        return users.splice(index, 1)[0]        // to return the object of the user which was removed
        //splice is used to removed the object. The first arg is the index and second is the no of elem from that postn to be deleted
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => users.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}