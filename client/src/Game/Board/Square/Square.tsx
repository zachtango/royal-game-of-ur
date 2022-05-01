import './Square.css';
import { coords } from '../../gameTypes';
import { isSafeSquare, isNonSquare } from '../../functions';
import rosette from '../../../assets/rosette2.png';
import square1 from '../../../assets/square.png';
import square2 from '../../../assets/square2.png';
import square3 from '../../../assets/square3.png';
import square4 from '../../../assets/square4.png';
import square5 from '../../../assets/square5.png';


type Props = {
    selectedPebble: coords,
    isTurn: boolean,
    coords: coords,
    canMoveTo: boolean,
    lastMove: boolean,
    selectPebble: () => void,
    onMovePebble: () => void
    children: JSX.Element | null
};

export default function Square({selectedPebble, coords, canMoveTo, lastMove, selectPebble, onMovePebble, children}: Props) {
    
    const isSelected = selectedPebble === coords;
    const isSafe = isSafeSquare(coords) && 'safe-square';
    const nonSquare = isNonSquare(coords) && 'non-square';
    let squareSrc;

    switch(coords){
        case '[0,1]':
        case '[2,1]':
        case '[0,7]':
        case '[2,7]':
        case '[1,4]':
            squareSrc = rosette;
            break;
        case '[1,1]':
        case '[0,4]':
        case '[2,4]':
        case '[0,6]':
        case '[2,6]':
            squareSrc = square2;
            break;
        case '[1,2]':
        case '[1,5]':
            squareSrc = square3;
            break;
        case '[0,0]':
        case '[2,0]':
            squareSrc = square4;
            break;
        case '[1,7]':
            squareSrc = square5;
            break;
        default:
            squareSrc = square1;
    }

    return (
        <div
            className={`square ${nonSquare}`}
            onMouseDown={canMoveTo ? () => onMovePebble() : () => selectPebble()}
        >
            {children}

            {!nonSquare && <img src={squareSrc} className='squareContent'/>}

            {!children && canMoveTo && <div 
                className='move-to-dot'
            />}

            {canMoveTo && <div
                className='move-to-square'
            />}

            {lastMove && <div 
                className='last-move'
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
