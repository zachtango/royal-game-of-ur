import { GameState, playerColor, moves, coords, diceState } from "../gameTypes";
import MoveDictionary from '../models/moveDictionary.json'

interface MoveDictionary{
    [key: coords]: {
        [key: string]: coords
    }[]
}

const INVALID_COORDS = '[-1,-1]';

function isSafeSquare(coords: coords){
    const r = parseInt(coords[1]), c = parseInt(coords[3]);
    return ( ( (r === 0 || r === 2) && (c === 1 || c === 7) ) || ( r === 1 && c === 4 ) );
}

/**
 * Roll 4 binary (50 - 50 to get 0 or 1) dice.
 * 
 * @param
 * @returns an integer between 0 and 4 (diceState type)
 */
function rollDice(): diceState{
    let counter = 0;
  
    for(let i = 0; i < 4; i++){
      counter += Math.floor(Math.random() * 2);
    }
  
    return counter as diceState;
}

/**
 * Calculate the dice state and player color for next turn
 * 
 * @param whiteIsNext current player turn
 * @returns an object with dice state and player color as properties
 */
function nextTurn(whiteIsNext: boolean){
    return {
        dice: rollDice(),
        whiteIsNext: !whiteIsNext
    }
}

/**
 * Calculate coords of next move for single pebble
 * 
 * @param 
 * @returns coords
 */
function nextMove(pebble: coords, dice: diceState, whiteIsNext: boolean, playerBoardPebbles: coords[], otherPlayerBoardPebbles: coords[]){
    let toCoords = (MoveDictionary as MoveDictionary)[pebble][dice - 1][whiteIsNext ? "white" : "black"];

    // toCoords is invalid if impossible to move pebble from coords given
    if(toCoords === INVALID_COORDS)
        return INVALID_COORDS;

    for(let i = 0; i < playerBoardPebbles.length; i++){
        if(playerBoardPebbles[i] === toCoords){
            toCoords = INVALID_COORDS;
            break;
        }
    }

    for(let i = 0; i < otherPlayerBoardPebbles.length; i++){
        if(isSafeSquare(otherPlayerBoardPebbles[i]) && otherPlayerBoardPebbles[i] === toCoords){
            toCoords = INVALID_COORDS;
            break;
        }
    }

    return toCoords;
}

/**
 * Calculate next game state given previous game state
 * 
 * @param 
 * @returns coords
 */
export function getNextGameState(gameState: GameState){
    let turn = gameState.whiteIsNext;
    let nextGameState: GameState;
    const nextMoves: moves = {};
    
    let canMove = false;
    do{
        nextGameState = {
            ...gameState,
            ...nextTurn(turn)
        }
        turn = nextGameState.whiteIsNext;

        const playerBoardPebbles = nextGameState.whiteIsNext ? gameState.white.boardPebbles : gameState.black.boardPebbles;
        const otherPlayerBoardPebbles = nextGameState.whiteIsNext ? gameState.black.boardPebbles : gameState.white.boardPebbles;

        // calc new moves for player
        playerBoardPebbles.forEach(coords => {
            const toCoords = nextMove(coords, nextGameState.dice, nextGameState.whiteIsNext, playerBoardPebbles, otherPlayerBoardPebbles);
            if(toCoords !== INVALID_COORDS){
                canMove = true;
                nextMoves[coords] = toCoords;
            }
        });
    } while(!canMove);

    return {nextGameState, nextMoves};
}

/**
 * Calculate next game state given previous game state
 * 
 * @param 
 * @returns coords
 */
export function getNewGameState(){
    const newGameState = {
        white: {
            pebbleCount: 7,
            boardPebbles: ['[0,3]' as coords]
        },
        black: {
            pebbleCount: 7,
            boardPebbles: ['[2,3]' as coords]
        },
        dice: rollDice(),
        whiteIsNext: true,
        selectedPebble: '[-1,-1]' as coords
    }

    while(newGameState.dice === 0){
        newGameState.dice = rollDice();
        newGameState.whiteIsNext = !newGameState.whiteIsNext;
    }

    const startCoords = newGameState.whiteIsNext ? '[0,3]' : '[2,3]'
    const newMoves = {
        [startCoords]: (MoveDictionary as MoveDictionary)[startCoords][newGameState.dice - 1][newGameState.whiteIsNext ? "white" : "black"]
    }

    return {newGameState, newMoves};
}
