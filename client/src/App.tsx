import React, { useEffect, useState } from 'react';
import './App.css';
import {Outlet, Route, Routes} from 'react-router-dom';
import CreateRoom from './Pages/CreateRoom';
import Room from './Pages/Room';
import {v4 as uuidv4} from 'uuid';
import { io, Socket } from 'socket.io-client';

function App() {
  const [socket] = useState<Socket>(io('http://198.58.97.88:9000'));
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [roomId] = useState<string>(uuidv4());
  const [isWhite, setIsWhite] = useState<boolean>();

  useEffect(() => {
   // fetch('/api/').then(res => console.log(res))
     // .then(res => console.log(res));
  });

  function createRoom(){
    setIsCreator(true);
    joinRoom(roomId);
  }

  function joinRoom(roomId: string){
    //socket emit
    console.log('socket emitted');
    socket.emit('join-room', roomId);

    socket.once('room-joined', () => {
      console.log('room-joined');
      socket.once('start-game', (isWhite: boolean) => {
        console.log('game started', isWhite);
        setIsWhite(isWhite);
        setIsGameStarted(true);
      });
    });
  }

  return (
    <Routes>
      <Route path='/' element={<div className='App'>
        <Outlet />
      </div>} >
          <Route path='/' element={<CreateRoom 
            createRoom={() => createRoom()}
            roomId={roomId as string}
          />} />
          <Route path=':roomId' element={<Room 
            socket={socket}
            isCreator={isCreator}
            isGameStarted={isGameStarted}
            isWhite={isWhite || false}
            joinRoom={(roomId) => joinRoom(roomId)}
          />} />
      </Route>
    </Routes>
    
  );
}

export default App;
