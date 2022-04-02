import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { coords, GameState, moves } from '../types';
import Board from './Board/Board';
import { isSafeSquare } from './functions';

interface Props{
    socket: Socket,
    isWhite: boolean
}

export default function Game({socket, isWhite}: Props){
    const [gameState, setGameState] = useState<GameState>();
    const [moves, setMoves] = useState<moves>();

    useEffect(() => {
        socket.emit('board-loaded');

        socket.on('update-state', (pkg: {newGameState: GameState, newMoves: moves}) => {
            console.log('update-state received');
            console.log(pkg);
            setGameState(pkg.newGameState);
            setMoves(pkg.newMoves);
        });
    }, [socket]);

    function onMovePebble(pebbleCoords: coords, toCoords: coords){
        const startCoords = isWhite ? '[0,3]' : '[2,3]';
        const otherStartCoords = isWhite ? '[2,3]' : '[0,3]';
        const playerBoardPebbles = isWhite ? gameState?.white.boardPebbles.filter(c => c !== pebbleCoords) : 
            gameState?.black.boardPebbles.filter(c => c !== pebbleCoords);
        let playerPebbleCount = isWhite ? gameState?.white.pebbleCount : gameState?.black.pebbleCount;
       

        if(playerPebbleCount && toCoords === (isWhite ? '[0,2]' : '[2,2]')){
            playerPebbleCount -= 1;
            if(playerPebbleCount === 0){
                alert('WINNER WINNER CHICKEN DINNER!');
                socket.emit('end-game');
                return;
            }
        }else
            playerBoardPebbles?.push(toCoords);

        const otherPlayBoardPebbles = isWhite ? gameState?.black.boardPebbles.filter(c => c !== toCoords) : 
            gameState?.white.boardPebbles.filter(c => c !== toCoords);
        const otherPlayerPebbleCount = isWhite ? gameState?.black.pebbleCount : gameState?.white.pebbleCount;

        if(playerBoardPebbles && ( playerBoardPebbles.length < (playerPebbleCount || 0) ) && !playerBoardPebbles.includes(startCoords))
            playerBoardPebbles.push(startCoords);

        if( otherPlayBoardPebbles && ( otherPlayBoardPebbles.length < (otherPlayerPebbleCount || 0) && !otherPlayBoardPebbles.includes(otherStartCoords) ) ){
            otherPlayBoardPebbles.push(otherStartCoords);
        }

        const player = {
            pebbleCount: playerPebbleCount,
            boardPebbles: playerBoardPebbles
        }

        const otherPlayer = {
            pebbleCount: otherPlayerPebbleCount,
            boardPebbles: otherPlayBoardPebbles
        }

        const newGameState = {
            ...gameState,
            white: isWhite ? player : otherPlayer,
            black: isWhite ? otherPlayer : player,
            whiteIsNext: isSafeSquare(toCoords) ? !gameState?.whiteIsNext : gameState?.whiteIsNext
        };
        
        console.log('pebble moved', toCoords);
        socket.emit('move-pebble', {
            gameState: newGameState,
            isWhite: isWhite
        });
    }

    function selectPebble(pebbleCoords: coords){
        if(isWhite !== gameState?.whiteIsNext)
            return;
        
        let selectedPebble: coords = '[-1,-1]';
        for(const coords in moves){
            if(coords === pebbleCoords){
                console.log('pebble selected ' + coords);
                selectedPebble = coords;
            }
        }

        setGameState({
            ...gameState as GameState,
            selectedPebble: selectedPebble
        });
    }

    if(gameState === undefined || moves === undefined){
        console.log(gameState, moves);
        return <p>Loading...</p>
    } else{
        console.log(gameState, moves);
    }

    return (
        <div className='game'>
            <h1>Player: {gameState.whiteIsNext ? "White" : "Black"}</h1>
            <h1>Dice: {gameState.dice}</h1>
            <h2>White: {gameState.white.pebbleCount}</h2>
            <h2>Black: {gameState.black.pebbleCount}</h2>
            <Board 
                gameState={gameState}
                moves={moves}
                isWhite={isWhite}
                selectPebble={selectPebble}
                onMovePebble={onMovePebble}
            />
        </div>
    )
}