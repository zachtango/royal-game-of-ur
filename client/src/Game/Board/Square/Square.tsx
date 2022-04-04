import './Square.css';
import { coords } from '../../../types';
import { isSafeSquare, isNonSquare } from '../../functions';

type Props = {
    selectedPebble: coords,
    isTurn: boolean,
    coords: coords,
    canMoveTo: boolean,
    selectPebble: () => void,
    onMovePebble: () => void
    children: JSX.Element | null
};

export default function Square({selectedPebble, coords, canMoveTo, selectPebble, onMovePebble, children}: Props) {
    
    const isSelected = selectedPebble === coords;
    const isSafe = isSafeSquare(coords) && 'safe-square';
    const nonSquare = isNonSquare(coords) && 'non-square';
    const moveTo = canMoveTo && 'move-to-square';
    // const captureSquare = children && canMoveTo && 'capture-square';

    return (
        <div
            className={`square ${isSafe} ${nonSquare} ${moveTo}`}
            onMouseDown={canMoveTo ? () => onMovePebble() : () => selectPebble()}
        >
            {children}

            {!children && canMoveTo && <div 
                style={{
                    position: 'absolute',
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    opacity: 0.5,
                    backgroundColor: 'gray'
                }}
            />}

            {isSelected && <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    zIndex: 1,
                    opacity: 0.5,
                    backgroundColor: 'gray'
                }}
            />}
        </div>
    );
}
