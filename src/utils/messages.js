const generateMessage = (username, text) => {
    return {
        username : username,
        text: text,
        createdAt : new Date().getTime() 
    }
}

const generateLocationMessage = (username,location_url) => {
    return {
        username: username,
        location_url: location_url,
        createdAt : new Date().getTime() 
    }
}


module.exports ={
    generateMessage,
    generateLocationMessage
}