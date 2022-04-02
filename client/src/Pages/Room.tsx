import { useParams } from "react-router-dom";
import JoinRoom from "./JoinRoom";
import Game from '../Game/Game';
import { Socket } from "socket.io-client";

interface Props{
    socket: Socket,
    isCreator: boolean,
    isGameStarted: boolean,
    isWhite: boolean,
    joinRoom: (roomId: string) => void
}

export default function Room({socket, isCreator, isGameStarted, isWhite, joinRoom}: Props){
    const params = useParams();

    const room = isGameStarted ? <Game 
           socket={socket}
           isWhite={isWhite}
        /> : isCreator ? <div>
            <h1>waiting for other player</h1>
            <p>share this link {window.location.href}</p>
        </div> : <JoinRoom
        joinRoom={() => joinRoom(params.roomId || '')}
    />;

    return room;
}