const { exec } = require('child_process');
const cors = require('cors');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_ENDPOINT,
  user: process.env.DB_USER,
  password: process.env.DB_KEY,
  database: process.env.DB_NAME
});

db.connect();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origins: ["*"],
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Headers': 'my-custom-header',
        'Access-Control-Allow-Credentials': true
      });
    }
  }
});

const {rollDice, canMovePebble} = require('./functions');
const MoveDictionary = require('./moveDictionary.json');
const { randomUUID } = require('crypto');

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

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;

  if(userId){
    socket.userId = userId;
    return next();
  } 

  socket.userId = randomUUID();
  next();
});

io.on('connection', (socket) => {
  socket.emit('user-id', {
    userId: socket.userId
  });

  const inRoomQuery = `SELECT * FROM in_room WHERE userId = '${socket.userId}'`;
  db.query(inRoomQuery, (err, res) => {
    console.log(res);
    if(res.length > 0){
      console.log('already waiting');
    } else{
      socket.emit('initialized');
      socket.on('join-room', ({roomId}) => { // fixme get tokens
        console.log(`${roomId} requested to join`);
    
        let isGameStarted = false;
    
        // filters default room socket is placed in
        const rooms = Array.from(socket.rooms).filter(r => r != socket.id);
        // get connectedSockets to room
        const connectedSockets = io.sockets.adapter.rooms.get(roomId);
    
        console.log(rooms, connectedSockets);
        // checks if socket is already in a room or if the specific room has 2 sockets already
        if(rooms.length > 0 || (connectedSockets && connectedSockets.length > 1)){
          console.log('room-join-error');
          socket.emit('room-join-error', 'room full or already in a room');
        } else{
    
          console.log('room-joined');
          // joins or creates a room w/ name roomId
          socket.join(roomId);
    
          socket.emit('room-joined');
          
          const roomJoinQuery = `INSERT INTO in_room (userId, socketId) VALUES ('${socket.userId}', '${socket.id}')`;
          db.query(roomJoinQuery);

          if(io.sockets.adapter.rooms.get(roomId).size === 2){
            const deleteUserQuery = `DELETE FROM in_room WHERE userId = '${socket.userId}'`;
            db.query(deleteUserQuery);

            isGameStarted = true;
    
            console.log('game started');
            let moves;
    
            const getRoomQuery = `SELECT * FROM active_rooms WHERE roomId LIKE '${roomId}'`;
            db.query(getRoomQuery, (err, res) => {
              let gameState;
              let newGame = false;
    
              if(res.length > 0){ // game exists
                gameState = JSON.parse(res[0].game_state);
                moves = JSON.parse(res[0].moves);
              } else{
                newGame = true;
                let dice = rollDice();
    
                gameState = {
                  white: {
                    pebbleCount: 7,
                    boardPebbles: ['[0,3]']
                  },
                  black: {
                    pebbleCount: 7,
                    boardPebbles: ['[2,3]']
                  },
                  dice: dice,
                  whiteIsNext: true,
                  selectedPebble: '[-1,-1]'
                }
    
                while(dice == 0){
                  dice = rollDice();
                  gameState.whiteIsNext = !gameState.whiteIsNext;
                }
                
                gameState.dice = dice;
    
                const startCoords = gameState.whiteIsNext ? '[0,3]' : '[2,3]';
    
                moves = {
                  [startCoords]: MoveDictionary[startCoords][gameState.dice - 1][gameState.whiteIsNext ? "white" : "black"]
                }
    
                const createRoomQuery = `INSERT INTO active_rooms (roomId, game_state, moves) VALUES ('${roomId}','${JSON.stringify(gameState)}','${JSON.stringify(moves)}')`;
                db.query(createRoomQuery);
              }
              console.log('new game: ' + newGame);
              // emit options
              socket.emit('start-game', {playerColor: 'white', gameState: gameState, moves: moves, newGame: newGame});
              socket.to(roomId).emit('start-game', {playerColor: 'black', gameState: gameState, moves: moves, newGame: newGame});
            });
          }
    
          socket.once('game-win', ({gameState, playerColor}) => {
            console.log('game won');
            socket.emit('on-game-win', {gameState, playerColor});
            socket.to(roomId).emit('on-game-win', {gameState, playerColor});
    
            socket.to(roomId).disconnectSockets();
            socket.disconnect();
          });
    
          socket.on('disconnect', () => {
            const deleteUserQuery = `DELETE FROM in_room WHERE userId = '${socket.userId}'`;
            db.query(deleteUserQuery);

            const connectedSockets = io.sockets.adapter.rooms.get(roomId);
            console.log('disconnect', connectedSockets);
            if(isGameStarted){
    
              if(connectedSockets){
                socket.to(roomId).emit('player-disconnect');
              } else{ // room empty
                // delete room in db
    
                const deleteQuery = `DELETE FROM active_rooms WHERE roomId = '${roomId}'`;
                db.query(deleteQuery, (err, res) => {
                  console.log(res);
                });
    
                isGameStarted = false;
              }
            }
          });
    
          socket.on('update-game', ({gameState, moves}) => {
    
            const newGameState = {...gameState};
            let canMove = false;
            const newMoves = {};
    
            do{
              newGameState.whiteIsNext = !newGameState.whiteIsNext;
              dice = rollDice();
              while(dice === 0){
                dice = rollDice();
                newGameState.whiteIsNext = !newGameState.whiteIsNext;
              }
              newGameState.dice = dice;
    
              // calc new moves
              const playerBoardPebbles = newGameState.whiteIsNext ? newGameState.white.boardPebbles : newGameState.black.boardPebbles;
              const otherPlayerBoardPebbles = newGameState.whiteIsNext ? newGameState.black.boardPebbles : newGameState.white.boardPebbles;
    
              playerBoardPebbles.forEach(c => {
                const moveCoords = canMovePebble(c, newGameState.whiteIsNext, dice, playerBoardPebbles, otherPlayerBoardPebbles);
                if(moveCoords !== '[-1,-1]'){
                  newMoves[c] = moveCoords;
                  canMove = true;
                }
              });
              
              
            } while(!canMove);
    
            const updateQuery = `UPDATE active_rooms SET game_state = '${JSON.stringify(newGameState)}', moves = '${JSON.stringify(newMoves)}' WHERE roomId LIKE '${roomId}'`;
            db.query(updateQuery);
    
            io.to(roomId).emit('on-update-game', {gameState: newGameState, moves: newMoves});
            
          });
        }
      });
    }
  });
});

httpServer.listen(9000, () => {
  console.log('io listening on 9000');
});

module.exports = app;
