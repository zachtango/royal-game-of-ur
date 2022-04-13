import { io, Socket } from 'socket.io-client';

interface layout {
    socket: Socket | null,
    connectSocket: () => void
}

const SocketService: layout = {
    socket: null,
    connectSocket(){
        this.socket = io('http://198.58.97.88:9000');
        // this.socket = io('http://localhost:9000');

    },
}


export default SocketService;