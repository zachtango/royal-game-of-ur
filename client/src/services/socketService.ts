import { io, Socket } from 'socket.io-client';

interface layout {
    socket: ExtendedSocket | null,
    connectSocket: () => void,
    onUserId: () => void,
    sendUserId: () => void,
    onInitialized: (listener: () => void) => void
}

interface ExtendedSocket extends Socket{
    userId: string
}

const SocketService: layout = {
    socket: null,
    connectSocket(){
        this.socket = <ExtendedSocket>io(process.env.REACT_APP_BACKEND_IP as string);
        // this.socket = <ExtendedSocket>io('http://localhost:9000');
    },
    onUserId(){
        const socket = this.socket;
        if(socket){
            socket.once('user-id', ({userId}) => {
                console.log(userId);
                socket.auth = {userId};
                localStorage.setItem('userId', userId);

                socket.userId = userId;
            });
        }
    },
    onInitialized(listener){
        const socket = this.socket;
        if(socket){
            socket.on('initialized', listener);
        }
    },
    sendUserId(){
        const socket = this.socket;
        if(socket){
            const userId = localStorage.getItem('userId');
            console.log(userId);
            if(userId){
                socket.auth = {userId};
                socket.connect();
            }
        }
    }
}

export default SocketService;