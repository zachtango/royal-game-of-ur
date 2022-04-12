import React, { useEffect, useState } from 'react';
import './App.css';
import {useSearchParams} from 'react-router-dom';
import CreateRoom from './Pages/CreateRoom';
import {v4 as uuidv4} from 'uuid';
import GameContext, { GameContextProps } from './Game/GameContext/gameContext';
import SocketService from './services/socketService';
import GameService from './services/gameService';
import Game from './Game/Game';
import Taskbar from './Taskbar/Taskbar';

function App(){
  const [isInRoom, setInRoom] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("black");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [roomId, setRoomId] = useState(uuidv4());
  const [searchParams] = useSearchParams();

  const gameContextValue: GameContextProps = {
    isInRoom,
    setInRoom,
    playerColor,
    setPlayerColor,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    roomId,
    setRoomId
  };

  useEffect(() => {
    console.log(document.cookie);
    SocketService.connectSocket();
  }, []);

  useEffect(() => {
    const roomId = searchParams.get('roomId');

    if(roomId && SocketService.socket){
      setRoomId(roomId);
      setInRoom(true);
      GameService.joinGameRoom(SocketService.socket, roomId).catch(err => console.log(err));
    } else
      setInRoom(false);
    

  }, [searchParams]);

  return (
    <GameContext.Provider value={gameContextValue}>
      <div className="App">
        <Taskbar />
        {isInRoom ? <Game /> : <CreateRoom />}
      </div>
    </GameContext.Provider>
  );
}

export default App;
