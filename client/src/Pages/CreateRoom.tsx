import React from 'react';
import { Link } from 'react-router-dom';

interface Props{
    createRoom: () => void,
    roomId: string
}

export default function CreateRoom({createRoom, roomId}: Props){

    return (
        <div className="createRoom">
            <h1>Play Game!</h1>
            <Link to={roomId} onClick={() => createRoom()}>Play</Link>
        </div>
    );
}