import React, { useContext, useEffect, useState } from 'react';
import gameContext from './GameContext/gameContext';
import { GameState, coords, moves } from './gameTypes';
import Board from './Board/Board';
import { isSafeSquare } from './functions';
import GameService from '../services/gameService';
import SocketService from '../services/socketService';

const defaultGameState: GameState = {
    white: {
        pebbleCount: 7,
        boardPebbles: ['[0,3]']
    },
    black: {
        pebbleCount: 7,
        boardPebbles: ['[2,3]']
    },
    whiteIsNext: true,
    dice: 1
}

export default function Game(){
    const socket = SocketService.socket;

    const {
        playerColor,
        isGameStarted,
        setPlayerColor,
        setGameStarted
    } = useContext(gameContext);

    const isWhite = playerColor === 'white';
    const [gameState, setGameState] = useState<GameState>(defaultGameState);
    const [moves, setMoves] = useState<moves>({});
    const [selectedPebble, setSelectedPebble] = useState<coords>('[-1,-1]');

    function handleOnStartGame(){
        if(socket){
            GameService.onStartGame(socket, ({playerColor, gameState, moves}) => {
                const cookie = document.cookie;
                if(cookie){
                    const playerColor = cookie.substring(7);

                    setPlayerColor(playerColor as "white" | "black");
                    console.log('cookie');
                } else{
                    setPlayerColor(playerColor);
                    

                    // set cookie
                    const date = new Date();
                    date.setTime(date.getTime() + (1*60*60*1000)); // plus 1 hour
                    const expires = '; expires=' + date.toUTCString();
                    document.cookie = `player=${playerColor}${expires};`;
                    console.log(document.cookie);
                }
                
                setGameStarted(true);
                setGameState(gameState);
                setMoves(moves);
            });
        }
    }

    function handleUpdateGame(gameState: GameState){
        if(socket){
            console.log('update game');
            GameService.updateGame(socket, gameState);
        }
    }

    function handleOnUpdateGame(){
        if(socket){
            GameService.onUpdateGame(socket, (gameState, moves) => {
                setGameState(gameState);
                setMoves(moves);
            });
        }
    }

    function handleOnGameWin(){
        if(socket){
            GameService.onGameWin(socket, ({gameState, playerColor}) => {
                alert(`${playerColor} wins!`);
                setGameState(gameState);
                setMoves({});
                socket.disconnect();
            });
        }
    }

    useEffect(() => {
        handleOnStartGame();
        handleOnUpdateGame();
        handleOnGameWin();
    });

    function handleMovePebble(pebbleCoords: coords, toCoords: coords){
        console.log(playerColor, gameState);
        if(socket){
            const startCoords = isWhite ? '[0,3]' : '[2,3]';
            const otherStartCoords = isWhite ? '[2,3]' : '[0,3]';
            
            // remove pebble from current position
            const playerBoardPebbles = isWhite ? gameState.white.boardPebbles.filter(c => c !== pebbleCoords) : 
                gameState.black.boardPebbles.filter(c => c !== pebbleCoords);
            let playerPebbleCount = isWhite ? gameState.white.pebbleCount : gameState.black.pebbleCount;
           
            // remove other player pebble from board if it was captured
            const otherPlayBoardPebbles = isWhite ? gameState.black.boardPebbles.filter(c => c !== toCoords) : 
            gameState.white.boardPebbles.filter(c => c !== toCoords);
            const otherPlayerPebbleCount = isWhite ? gameState.black.pebbleCount : gameState.white.pebbleCount;

            // check if pebble has been moved to finish
            if(playerPebbleCount && toCoords === (isWhite ? '[0,2]' : '[2,2]')){
                playerPebbleCount -= 1;

                // handle winning
                if(playerPebbleCount === 0){
                    GameService.gameWin(socket, {gameState: {
                        ...gameState,
                        white: isWhite ? {pebbleCount: 0, boardPebbles: playerBoardPebbles} : gameState.white,
                        black: isWhite ? gameState.black : {pebbleCount: 0, boardPebbles: playerBoardPebbles}
                    }, playerColor});
                    return;
                }
            } else
                playerBoardPebbles.push(toCoords);
    
            // re plenish player start pebbles if player has pebbles left
            if( (playerBoardPebbles.length < playerPebbleCount) && !playerBoardPebbles.includes(startCoords) )
                playerBoardPebbles.push(startCoords);
    
            // re plenish other player start pebbles if other player has pebbles left
            if( (otherPlayBoardPebbles.length < otherPlayerPebbleCount) && !otherPlayBoardPebbles.includes(otherStartCoords) )
                otherPlayBoardPebbles.push(otherStartCoords);
    
            // construct new states
            const player = {
                pebbleCount: playerPebbleCount,
                boardPebbles: playerBoardPebbles
            };
            const otherPlayer = {
                pebbleCount: otherPlayerPebbleCount,
                boardPebbles: otherPlayBoardPebbles
            };
            const newGameState = {
                ...gameState,
                white: isWhite ? player : otherPlayer,
                black: isWhite ? otherPlayer : player,
                whiteIsNext: isSafeSquare(toCoords) ? gameState.whiteIsNext : !gameState.whiteIsNext
            };
            
            setGameState(newGameState);
            setSelectedPebble('[-1,-1]');
            handleUpdateGame({...newGameState, whiteIsNext: !newGameState.whiteIsNext});
        }
        
    }

    function handleSelectPebble(pebbleCoords: coords){
        if(isWhite !== gameState.whiteIsNext)
            return;
        
        let selectedPebble: coords = '[-1,-1]';
        for(const coords in moves){
            if(coords === pebbleCoords){
                console.log('pebble selected ' + coords);
                selectedPebble = coords;
            }
        }

        setSelectedPebble(selectedPebble);
    }

    const game = gameState ? <div className='game'>
        <h1>You are {playerColor}</h1>
        <h1>Player Move: {gameState.whiteIsNext ? "White" : "Black"}</h1>
        <h1>Dice: {gameState.dice}</h1>
        <h2>White: {gameState.white.pebbleCount}</h2>
        <h2>Black: {gameState.black.pebbleCount}</h2>
        <Board 
            gameState={gameState}
            nextMove={moves[selectedPebble]}
            isWhite={playerColor === 'white'}
            selectedPebble={selectedPebble}
            selectPebble={handleSelectPebble}
            onMovePebble={handleMovePebble}
        />
    </div> : <h1>Loading</h1>;

    return (
        isGameStarted ? game : <div>
            <h1>waiting for other player</h1>
            <p>share this link {window.location.href}</p>
        </div>
    );
}