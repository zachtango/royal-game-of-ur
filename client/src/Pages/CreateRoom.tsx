import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import gameContext from '../Game/GameContext/gameContext';

export default function CreateRoom(){
    const {
        roomId
    } = useContext(gameContext)

    return (
        <div className="createRoom">
            <h1>Play Game!</h1>
            <Link to={`/?roomId=${roomId}`}>Play</Link>
        </div>
    );
}