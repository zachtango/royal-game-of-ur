import './Board.css';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Square from './Square/Square';
import Pebble from './Square/Pebble/Pebble';

import type {coords, GameState, moves} from '../../types';

interface Props {
    gameState: GameState,
    moves: moves,
    isWhite: boolean,
    selectPebble: (pebbleCoords: coords) => void
    onMovePebble: (pebbleCoords: coords, toCoords: coords) => void
};

export default function Board({
    gameState,
    moves,
    isWhite,
    selectPebble,
    onMovePebble
}: Props){
    console.log(gameState);
    if(!gameState){
        return <div>loading...</div>
    }

    const boardSquares: JSX.Element[] = [];
    for(let r = 0; r < 3; r++){
        for(let c = 0; c < 8; c++){
            const coords: coords = `[${r},${c}]`;
            
            const isTurn = isWhite === gameState.whiteIsNext;
            console.log(isTurn);
            const canMoveTo = moves[gameState.selectedPebble] === coords;
            const pebble = gameState.white.boardPebbles.includes(coords) ? <Pebble 
                canDrag={isTurn} white={true}
            /> : gameState.black.boardPebbles.includes(coords) ? <Pebble
                canDrag={isTurn} white={false}
            /> : null;

            boardSquares.push(
                <Square
                    key={coords}
                    isTurn={isTurn}
                    canMoveTo={canMoveTo}
                    coords={coords}
                    selectedPebble={gameState.selectedPebble}

                    selectPebble={() => selectPebble(coords)}
                    onMovePebble={() => onMovePebble(gameState.selectedPebble, moves[gameState.selectedPebble])}
                >
                    {pebble}
                </Square>
            );
        }
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="board">
                {boardSquares}
            </div>
        </DndProvider>
    );
}