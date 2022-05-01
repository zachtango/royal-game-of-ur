import { Socket } from 'socket.io-client';

import { GameState, moves, coords } from '../Game/gameTypes';

const GameService = {

    async joinGameRoom(socket: Socket, {roomId}: {roomId: string}) {
        console.log('test');

        socket.emit('join-room', {roomId});
        // return new Promise((resolve, reject) => {
        //     socket.emit('join-room', {roomId});
        //     socket.on('room-joined', () => resolve(true));
        //     socket.on('room-join-error', ({error}) => reject(error));
        // });
    },

    async move(
        socket: Socket,
        isWhite: boolean,
        pebbleCoords: coords,
        toCoords: coords
    ){
        socket.emit('move', {isWhite, pebbleCoords, toCoords});
    },

    async onUpdateGame(
        socket: Socket,
        listener: (gameState: GameState, moves: moves, lastMove: [coords, coords]) => void
    ){
        socket.on('on-update-game', ({gameState, moves, lastMove}) => listener(gameState, moves, lastMove));
    },

    async onStartGame(
        socket: Socket,
        listener: ({playerColor, gameState, moves} : {
            playerColor: 'white' | 'black',
            gameState: GameState,
            moves: moves,
            newGame: boolean
        }) => void
    ){
        socket.on('start-game', listener);
    },

    async gameWin(socket: Socket, {gameState, playerColor}: {gameState: GameState, playerColor: 'white' | 'black'}){
        socket.emit('game-win', {gameState, playerColor});
    },

    async onGameWin(
        socket: Socket,
        listener: ({gameState, playerColor}: {gameState: GameState, playerColor: 'white' | 'black'}) => void
    ){
        socket.once('on-game-win', listener);
    },

    async onNumOfGames(
        socket: Socket,
        listener: (numOfGames: number) => void
    ){
        socket.on('number-of-games', listener);
    }
}

export default GameService;