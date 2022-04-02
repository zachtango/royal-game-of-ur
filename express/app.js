const cors = require('cors');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

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



app.get('/', (req, res) => {
  console.log('express 9000 visited');
  res.json('lol');
});

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  socket.on('join-room', (roomId) => {
    console.log(`${roomId} requested to join`);

    // filters default room socket is placed in
    const rooms = Array.from(socket.rooms).filter(r => r != socket.id);
    // get connectedSockets to room
    const connectedSockets = io.sockets.adapter.rooms.get(roomId);

    console.log(rooms, connectedSockets);
    // checks if socket is already in a room or if the specific room has 2 sockets already
    if(rooms.length > 0 || (connectedSockets && connectedSockets.length > 1)){
      console.log('room-join-errpr');
      socket.emit('join-room-error', 'room full or already in a room');
    } else{
      console.log('room-joined');
      // joins or creates a room w/ name roomId
      socket.join(roomId);

      socket.emit('room-joined');
      
      if(io.sockets.adapter.rooms.get(roomId).size === 2){
        console.log('game started');

        socket.emit('start-game', true);
        socket.to(roomId).emit('start-game', false);

        
      }

      socket.on('board-loaded', () => {
        let dice = rollDice(), whiteIsNext = true;
        while(dice === 0){
          dice = rollDice();
          whiteIsNext = !whiteIsNext;
        }
        

        console.log('board-loaded')
        const gameState = {
          white: {
            pebbleCount: 7,
            boardPebbles: ['[0,3]']
          },
          black: {
            pebbleCount: 7,
            boardPebbles: ['[2,3]']
          },
          dice: dice,
          whiteIsNext: whiteIsNext,
          selectedPebble: '[-1,-1]'
        }

        const startCoords = whiteIsNext ? '[0,3]' : '[2,3]';
        const moves = {
          [startCoords]: MoveDictionary[startCoords][dice - 1][whiteIsNext ? "white" : "black"]
        }

        socket.emit('update-state', {newGameState: gameState, newMoves: moves});
        socket.to(roomId).emit('update-state', {newGameState: gameState, newMoves: moves});

        socket.once('end-game', () => {
          socket.removeAllListeners();
        });

        socket.on('move-pebble', ({gameState, isWhite}) => {
          // console.log('moved pebble', gameState, isWhite);
          const newGameState = {...gameState, selectedPebble: '[-1,-1]'};
          let canMove = false;

          do{
            newGameState.whiteIsNext = !newGameState.whiteIsNext;
            dice = rollDice();
            while(dice === 0){
              dice = rollDice();
              newGameState.whiteIsNext = !newGameState.whiteIsNext;
            }
            newGameState.dice = dice;
  
            // calc new moves
            const newMoves = {};
            const playerBoardPebbles = newGameState.whiteIsNext ? newGameState.white.boardPebbles : newGameState.black.boardPebbles;
            const otherPlayerBoardPebbles = newGameState.whiteIsNext ? newGameState.black.boardPebbles : newGameState.white.boardPebbles;
  
            playerBoardPebbles.forEach(c => {
              const moveCoords = canMovePebble(c, newGameState.whiteIsNext, dice, playerBoardPebbles, otherPlayerBoardPebbles);
              if(moveCoords !== '[-1,-1]'){
                newMoves[c] = moveCoords;
                canMove = true;
              }
            });
  
            socket.emit('update-state', {newGameState: newGameState, newMoves: newMoves});
            socket.to(roomId).emit('update-state', {newGameState: newGameState, newMoves: newMoves});
          } while(!canMove);
          
        });
      });
    }

  });
});

httpServer.listen(9000, () => {
  console.log('io listening on 9000');
});

module.exports = app;
