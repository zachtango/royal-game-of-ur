import { diceState } from "../gameTypes";

import './ScoreBoard.css';

type Props = {
    playerColor: string,
    whiteIsNext: boolean,
    dice: diceState,
    white: number,
    black: number
};

export default function ScoreBoard({playerColor, whiteIsNext, dice, white, black}: Props){
    const moveText = whiteIsNext ? (playerColor === "white" ? "Your move" : "Waiting for opponent") : (playerColor === "black" ? "Your move" : "Waiting for opponent");

    const whitePebbles = [];
    const blackPebbles = [];

    for(let i = 0; i < white; i++){
        whitePebbles.push(<div className='circle'/>)
    }
    for(let i = 0; i < black; i++){
        blackPebbles.push(<div className='circle circleBlack' />)
    }

    return (
        <div className='scoreBoard'>
            <h3>You are {playerColor}</h3>
            <h3>{moveText}</h3>
            <h3>Roll: {dice}</h3>
            <div className="pebbleContainer">
                {whitePebbles}
            </div>
            <div className="pebbleContainer">
                {blackPebbles}
            </div>
        </div>
    );
}