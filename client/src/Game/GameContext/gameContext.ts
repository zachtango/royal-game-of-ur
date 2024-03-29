import React from 'react';

export interface GameContextProps{
    initialized: boolean,
    setInitialized: (initialized: boolean) => void,
    isInRoom: boolean,
    setInRoom: (inRoom: boolean) => void,
    playerColor: "white" | "black",
    setPlayerColor: (color: "white" | "black") => void,
    isPlayerTurn: boolean,
    setPlayerTurn: (turn: boolean) => void,
    isGameStarted: boolean,
    setGameStarted: (started: boolean) => void,
    roomId: string,
    setRoomId: (id: string) => void
}

const defaultState: GameContextProps = {
    initialized: false,
    setInitialized: () => {},
    isInRoom: false,
    setInRoom: () => {},
    playerColor: "black",
    setPlayerColor: () => {},
    isPlayerTurn: false,
    setPlayerTurn: () => {},
    isGameStarted: false,
    setGameStarted: () => {},
    roomId: '',
    setRoomId: () => {}
}


export default React.createContext(defaultState);