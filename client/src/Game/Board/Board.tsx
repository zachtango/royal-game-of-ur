import './Board.css';

import Square from './Square/Square';
import Pebble from './Square/Pebble/Pebble';

import type {GameState, coords} from '../gameTypes';

interface Props {
    gameState: GameState,
    nextMove: coords,
    isWhite: boolean,
    selectedPebble: coords,
    lastMove: [coords, coords],
    selectPebble: (pebbleCoords: coords) => void
    onMovePebble: (pebbleCoords: coords, toCoords: coords) => void
};

export default function Board({
    gameState,
    nextMove,
    isWhite,
    selectedPebble,
    lastMove,
    selectPebble,
    onMovePebble
}: Props){

    const boardSquares: JSX.Element[] = [];
    for(let r = 0; r < 3; r++){
        for(let c = 0; c < 8; c++){
            console.log(lastMove);
            const coords: coords = `[${r},${c}]`;
            
            const isTurn = isWhite === gameState.whiteIsNext;
            const canMoveTo = nextMove === coords;

            const pebble = gameState.white.boardPebbles.includes(coords) ? <Pebble white={true} canMoveTo={canMoveTo}/> : 
                gameState.black.boardPebbles.includes(coords) ? <Pebble white={false} canMoveTo={canMoveTo} /> : null;

            boardSquares.push(
                <Square
                    key={coords}
                    isTurn={isTurn}
                    canMoveTo={canMoveTo}
                    coords={coords}
                    selectedPebble={selectedPebble}
                    lastMove={coords === lastMove[0] || coords === lastMove[1]}
                    selectPebble={() => selectPebble(coords)}
                    onMovePebble={() => onMovePebble(selectedPebble, nextMove)}
                >
                    {pebble}
                </Square>
            );
        }
    }

    return (
        <div className='board-container'>
            <div className={`board ${isWhite && 'mirror'}`}>
                {boardSquares}
            </div>
        </div>
    );
}