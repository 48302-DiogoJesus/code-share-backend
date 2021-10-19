const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
    cors : {
        origin: '*'
    }
});

/**
 * Express APP extra functionalities
 */
app.use(cors());
app.use(express.json());

/**
 * Choose a PORT for the Socket Server to run on
 */
const SERVER_PORT = process.env.PORT || 3000;

/**
 * Stores the names of the clients who have already sent messages and are still online
 */
clients = []

/**
 * Keeps track of the number of live connections
 */
var connections = 0

/**
 * Individual Connection handler (for each client)
 */
io.on('connection', socket => {

    // Identifies the user of this socket connection
    var localUsername = 'Unknown User'

    // Welcome the user with a custom message
    socket.emit('welcome', 'Welcome to the chat !')
    // Warn all users that a new user has joined
    io.emit('newUser', 'A user has entered the chat')
    // Increase the connections counter
    connections++
    // Tell all users to update their user counters
    io.emit('usersNumber', connections)

    // Handle a message from the client
    socket.on('message', (data) => {
        try {
            // Update a variable as soon as the client identifies himself with a username
            localUsername = data.username
            // Add username to clients list in case it's not already
            if (!clients.includes(localUsername)) clients.push(localUsername)

            let message = data.message.toString()
            // Broadcast message to all clients
            io.emit('message', {'username' : localUsername, message})
        } catch (error) {
            /**
             * In case an error occurs
             * Most likely it happends if data is corrupted and 'username' and 'message' can't be parsed
             */
            console.log('An error occured upon message receival : ' + error)
        }
    })   
    
    // Handle when a socket user disconnects
    socket.on('disconnect', () => {
        // Tell other users who disconnected
        io.emit('userLeft', {username: localUsername})
        // Decrease the connection counter and tell users
        connections--
        io.emit('usersNumber', connections)
        /**
         * ! Try/Catch Needed in case a 'Unknow User' (hasn't sent a message yet) disconnects
         */
        try {
            // Remove user from users list
            clients.pop(localUsername)
        } catch {}
    })
})

/**
 * Socket Server Listener
 */
http.listen(SERVER_PORT, () => {
    console.log(`Socket Server on Port: ${SERVER_PORT}`)
})