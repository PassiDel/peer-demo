require('dotenv').config()
const WEB_PORT = process.env.WEB_PORT || 3000
const PEER_PORT = process.env.PEER_PORT || 3001
const path = require('path')
const express = require('express')
const {PeerServer} = require('peer')
const app = express()
const server = require('http').createServer(app)
const {Server} = require("socket.io")
const {v4: uuidV4} = require('uuid')

const io = new Server(server);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use('/scripts', express.static(path.join(__dirname, 'node_modules/peerjs/dist')))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room, peer_port: PEER_PORT})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(WEB_PORT, () => {
    console.log(`Server started on localhost:${WEB_PORT}`)
})


PeerServer({
    port: PEER_PORT,
    debug: true
}, () => {
    console.log(`Peer Server started on localhost:${PEER_PORT}`)
})
