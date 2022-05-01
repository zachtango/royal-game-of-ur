import React, { useContext, useEffect, useState } from 'react';
import gameContext from './GameContext/gameContext';
import { GameState, coords, moves } from './gameTypes';
import Board from './Board/Board';
import { isSafeSquare } from './functions';
import GameService from '../services/gameService';
import SocketService from '../services/socketService';

import Waiting from '../Pages/Waiting';

import './Game.css';
import PlayerInfo from './PlayerInfo/PlayerInfo';
import GameActions from './GameActions/GameActions';

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
    const [lastMove, setLastMove] = useState<[coords, coords]>(['[-1,-1]', '[-1,-1]']);

    function deletePlayerCookies(){
        const cookies = document.cookie.split(';');

        for(let i = 0; i < cookies.length; i++){
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
            if(name === 'player'){
                console.log('delete player cookie');
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }
    }

    function handleOnStartGame(){
        if(socket){
            GameService.onStartGame(socket, ({playerColor, gameState, moves, newGame}) => {
                if(newGame){
                    setPlayerColor(playerColor);
                    
                    deletePlayerCookies();

                    // set cookie
                    const date = new Date();
                    date.setTime(date.getTime() + (1*60*60*1000)); // plus 1 hour
                    const expires = '; expires=' + date.toUTCString();
                    document.cookie = `player=${playerColor}${expires};`;
                    console.log(document.cookie);
                } else{
                    const cookie = document.cookie;
                    if(cookie){
                        const playerColor = cookie.substring(7);
    
                        setPlayerColor(playerColor as "white" | "black");
                        console.log('cookie');
                    } else{
                        console.log('ERROR: no cookie');
                    }
                    
                }
                
                setGameStarted(true);
                setGameState(gameState);
                setMoves(moves);
            });
        }
    }

    function handleOnUpdateGame(){
        if(socket){
            GameService.onUpdateGame(socket, (gameState, moves, lastMove) => {
                console.log(lastMove);

                setGameState(gameState);
                setMoves(moves);
                setLastMove(lastMove);
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
    }, []);

    function handleMovePebble(pebbleCoords: coords, toCoords: coords){
        if(socket){
            GameService.move(socket, isWhite, pebbleCoords, toCoords);
            
            setSelectedPebble('[-1,-1]');
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
        <h2>Roll: {gameState.dice}</h2>
        <PlayerInfo 
            turn={gameState.whiteIsNext !== isWhite}
            text="Waiting for opponent"
            pebbleNum={!isWhite ? gameState.white.pebbleCount : gameState.black.pebbleCount}
        />
        <Board 
            gameState={gameState}
            nextMove={moves[selectedPebble]}
            isWhite={playerColor === 'white'}
            selectedPebble={selectedPebble}
            selectPebble={handleSelectPebble}
            onMovePebble={handleMovePebble}
            lastMove={lastMove}
        />
        <PlayerInfo
            turn={gameState.whiteIsNext === isWhite}
            text="Your turn"
            pebbleNum={isWhite ? gameState.white.pebbleCount : gameState.black.pebbleCount}
        />
        <GameActions />
    </div> : <h1>Loading</h1>;

    return isGameStarted ? game : <Waiting />
}