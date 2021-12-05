const socket = io("/")
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

const myPeer = new Peer(undefined, {
    path: '/',
    host: '/',
    port: PEER_PORT
})
myPeer.on('open', id => {

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        socket.emit('join-room', ROOM_ID, id)
        addVideoStream(myVideo, stream)

        myPeer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            console.log("connected", userId)
            connectToNewUser(userId, stream)
        })
        socket.on('user-disconnected', userId => {
            console.log("disconnected", userId)
            const peer = peers[userId]
            if (!peer) return

            peer.call.close()
            peer.video.remove()
            delete peers[userId]
        })
    })
})


function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    peers[userId] = { video, call }
}


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}
