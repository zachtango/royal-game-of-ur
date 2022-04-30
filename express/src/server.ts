import express from 'express';

import { exec } from 'child_process';

import {Server, Socket} from 'socket.io';

import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { getNewGameState, getNextGameState } from './shared/functions';
import { GameState, moves } from './gameTypes';

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
app.post('/payload', (req, res) => {
    console.log('github webhook received');
 
    exec('node ~/update.js >> ~/logs', (err, stdout, stderr) => {
        if(err){
        console.log(`error: ${err.message}`);
        return;
        }

        if(stderr){
        console.log(`stderr: ${stderr}`);
        return;
        }

        console.log(`stdout: ${stdout}`);
    });

    res.json("ok");
});

// app.use('/api', apiRouter);

const active_games: {[key: string]: {gameState: GameState, moves: moves}} = {};
const active_users = new Set<string>();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
    //      origin: "*",
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
    console.log(mySocket.userId);

    mySocket.emit('user-id', {
        userId: mySocket.userId
    });

    if(active_users.has(mySocket.userId)){
        console.log('user already in-game or in-queue');
        return;
    }

    mySocket.on('join-room', ({roomId}: {roomId: string}) => {
        console.log('want to join room');

        // filters default room socket is placed in
        const rooms = Array.from(socket.rooms).filter(r => r != socket.id);
        // get connectedSockets to room
        const connectedSockets = io.sockets.adapter.rooms.get(roomId);
        
        if( rooms.length > 0 || (connectedSockets && connectedSockets.size > 1) ){
            socket.emit('join-room-error');
        } else{
            
            active_users.add(mySocket.userId);

            // joins or creates a room w/ name roomId
            socket.join(roomId);
            socket.emit('room-joined');

            const room = io.sockets.adapter.rooms.get(roomId);
            if(room && room.size === 2){
                console.log('game start');
                const game = active_games[roomId];
                
                // fixme handle existing game
                if(game){
                    socket.emit('start-game', {
                        gameState: game.gameState, 
                        moves: game.moves,
                        newGame: false
                    });

                    console.log('game exists');
                } else{
                    const {newGameState, newMoves} = getNewGameState();
                
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
                }
            }

            socket.on('update-game', ({gameState}: {gameState: GameState}) => {
                const {nextGameState, nextMoves} = getNextGameState(gameState);

                active_games[roomId] = {gameState: nextGameState, moves: nextMoves};

                io.to(roomId).emit('on-update-game', {gameState: nextGameState, moves: nextMoves});
            });

            socket.once('game-win', ({gameState, playerColor}) => {
                console.log('game won');
                socket.emit('on-game-win', {gameState, playerColor});
                socket.to(roomId).emit('on-game-win', {gameState, playerColor});
        
                socket.to(roomId).disconnectSockets();
                socket.disconnect();
              });

            socket.on('disconnect', () => {
                active_users.delete(mySocket.userId);
                
                // both players left
                if(!io.sockets.adapter.rooms.get(roomId))
                    delete active_games[roomId];

                console.log(active_games, active_users);
            });
        }

    });
});

// Export here and start in a diff file (for testing).
export default httpServer;
