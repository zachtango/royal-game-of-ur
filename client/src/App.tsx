import React, { useEffect, useState } from 'react';
import './App.css';
import {useSearchParams} from 'react-router-dom';
import CreateRoom from './Pages/CreateRoom';
import {v4 as uuidv4} from 'uuid';
import GameContext, { GameContextProps } from './Game/GameContext/gameContext';
import SocketService from './services/socketService';
import GameService from './services/gameService';
import Game from './Game/Game';
import Taskbar from './components/Taskbar';

function App(){
  const [isInRoom, setInRoom] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("black");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [roomId, setRoomId] = useState(uuidv4());
  const [searchParams] = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const [numOfGames, setNumOfGames] = useState(0);

  const gameContextValue: GameContextProps = {
    initialized,
    setInitialized,
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
    SocketService.connectSocket();
    SocketService.sendUserId();
    SocketService.onUserId();
  }, []);

  useEffect(() => {
    if(SocketService.socket)
      GameService.onNumOfGames(SocketService.socket, setNumOfGames);

  }, [SocketService.socket]);

  useEffect(() => {
    const roomId = searchParams.get('roomId');

    if(roomId && SocketService.socket){ // initialized &&
      
      setRoomId(roomId);
      setInRoom(true);
      GameService.joinGameRoom(SocketService.socket, {roomId});
    } else
      setInRoom(false);
    

  }, [searchParams, initialized]);

  return (
    <GameContext.Provider value={gameContextValue}>
      <div className="App">
        <Taskbar />
        <h4>Active Games: {numOfGames}</h4>
        {isInRoom ? <Game /> : <CreateRoom />}
      </div>
    </GameContext.Provider>
  );
}

export default App;
