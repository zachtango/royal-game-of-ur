import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import gameContext from '../Game/GameContext/gameContext';

export default function CreateRoom(){
    const {
        roomId
    } = useContext(gameContext)

    return (
        <div className="createRoom" style={{textAlign: 'center'}}>
            <h1>Play Game!</h1>
            <Link to={{pathname: '/', search: `?roomId=${roomId}`}}>Play with a Friend</Link>
        </div>
    );
}