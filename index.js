const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors : {
        origin: '*'
    }
});

const SERVER_PORT = process.env.PORT || 3000;

clients = []

var connections = 0

io.on('connection', socket => {

    var localUsername = 'Unknown'

    socket.emit('welcome', 'Welcome to the chat !')
    io.emit('newUser', 'A user has entered the chat')
    connections++
    
    socket.on('message', (data) => {
        try {
            let username = data.username
            localUsername = username

            if (!clients.includes(username)) clients.push(username)
            let message = data.message
            io.emit('message', {username, message})
        } catch (error) {
            console.log('An error occured upon message receival : ' + error)
        }
    })   
    
    socket.on('disconnect', () => {
        io.emit('userLeft', {username: localUsername})
        try {
            clients.pop(localUsername)
        } catch {}
        connections--
    })
})

setInterval(() => {
    io.emit('usersNumber', connections)
}, 1500)

http.listen(SERVER_PORT, () => {
    console.log(`Socket Server on Port: ${SERVER_PORT}`)
})