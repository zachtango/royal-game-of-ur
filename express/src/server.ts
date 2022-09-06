import express from 'express';

import { spawn, exec } from 'child_process';

import {Server, Socket} from 'socket.io';

import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { getDefaultGameState, getNewGameState, getNextGameState } from './shared/functions';
import { GameState, moves, coords } from './gameTypes';

interface ExtendedSocket extends Socket{
    userId: string
}

// Constants
const app = express();


/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/


/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/

// Add api router
app.get('/', (req, res) => {
	console.log('test');
	res.send('ok');
});

app.post('/payload', (req, res) => {
    // console.log('github webhook received');

    const child = spawn('/home/ec2-user/server/update', [], {
	detached: true,
	stdio: ['ignore', 'ignore', 'ignore']
    }
	
    child.unref();

    res.json("ok");
});

// app.use('/api', apiRouter);

const active_games: {[key: string]: {gameState: GameState, moves: moves}} = {};
const active_users = new Set<string>();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});

io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;

    const mySocket = <ExtendedSocket>socket;

    if(userId){
      mySocket.userId = userId;
      return next();
    } 
  
    mySocket.userId = randomUUID();
    next();
});
  

io.on('connection', (socket) => {
    const mySocket = <ExtendedSocket>socket;
    console.log('active games', active_games)
    console.log('active users', active_users)

    mySocket.emit('user-id', {
        userId: mySocket.userId
    });

    mySocket.emit('number-of-games', Object.keys(active_games).length);

//    if(active_users.has(mySocket.userId)){
//        console.log('user already in-game or in-queue');
//        return;
//    }

    mySocket.on('join-room', ({roomId}: {roomId: string}) => {
        console.log('want to join room');

        // filters default room socket is placed in
        const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
        // get connectedSockets to room
        const connectedSockets = io.sockets.adapter.rooms.get(roomId);
        console.log(connectedSockets);
        if( rooms.length > 0 || (connectedSockets && connectedSockets.size > 1) ){
	    console.log('join-room-error')	
	    socket.emit('join-room-error')
        } else{
            
            active_users.add(mySocket.userId);

            // joins or creates a room w/ name roomId
            socket.join(roomId);
            socket.emit('room-joined');

            const room = io.sockets.adapter.rooms.get(roomId);
            if(room && room.size === 2){
                console.log('game start', mySocket.userId);
                const game = active_games[roomId];

                // handle existing game
                if(game){
                    socket.emit('start-game', {
                        gameState: game.gameState, 
                        moves: game.moves,
                        newGame: false
                    });

                    console.log('game exists');
                } else{

                    const {newGameState, newMoves} = getDefaultGameState();
                
                    // add new game to active games
                    active_games[roomId] = {gameState: newGameState, moves: newMoves};
    
                    socket.emit('start-game', {
                        gameState: newGameState, 
                        moves: newMoves, 
                        playerColor: 'white',
                        newGame: true
                    });
                    socket.to(roomId).emit('start-game', {
                        gameState: newGameState, 
                        moves: newMoves, 
                        playerColor: 'black',
                        newGame: true
                    });

                    io.emit('number-of-games', Object.keys(active_games).length);
                }
            }

            socket.on('move', ({isWhite, pebbleCoords, toCoords}: {isWhite: boolean, pebbleCoords: coords, toCoords: coords}) => {
                const currGameState = active_games[roomId].gameState;

                // calculate next game state
                const {nextGameState, nextMoves} = getNextGameState(getNewGameState(currGameState, isWhite, pebbleCoords, toCoords));

                active_games[roomId] = {gameState: nextGameState, moves: nextMoves};

                // handle game win
                if(nextGameState.black.pebbleCount === 0){
                    console.log('game won');
                    io.to(roomId).emit('on-game-win', {gameState: nextGameState, playerColor: "black"});
        
                    io.to(roomId).disconnectSockets();
                    return;
                } else if(nextGameState.white.pebbleCount === 0){
                    io.to(roomId).emit('on-game-win', {gameState: nextGameState, playerColor: "white"});
                    console.log('game won');
                    io.to(roomId).disconnectSockets();
                    return;
                }

                io.to(roomId).emit('on-update-game', {gameState: nextGameState, moves: nextMoves, lastMove: [pebbleCoords, toCoords]});
            });

            socket.on('update-game', ({gameState}: {gameState: GameState}) => {
                const {nextGameState, nextMoves} = getNextGameState(gameState);

                active_games[roomId] = {gameState: nextGameState, moves: nextMoves};

                io.to(roomId).emit('on-update-game', {gameState: nextGameState, moves: nextMoves});
            });

            socket.on('disconnect', () => {
                active_users.delete(mySocket.userId);
                
                // both players left
                if(!io.sockets.adapter.rooms.get(roomId))
                    delete active_games[roomId];

                io.emit('number-of-games', Object.keys(active_games).length);
            });
        }

    });
});

// Export here and start in a diff file (for testing).
export default httpServer;
