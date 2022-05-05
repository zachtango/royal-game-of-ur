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
    if(dice === 0)
        return INVALID_COORDS;

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
export function getDefaultGameState(){
    const newGameState = {
        white: {
            pebbleCount: 1,
            boardPebbles: ['[0,3]' as coords]
        },
        black: {
            pebbleCount: 1,
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

/**
 * Calculate next game state given previous game state
 * 
 * @param 
 * @returns coords
 */
export function getNewGameState(gameState: GameState, isWhite: boolean, pebbleCoords: coords, toCoords: coords): GameState{
    const startCoords = isWhite ? '[0,3]' : '[2,3]';
    const otherStartCoords = isWhite ? '[2,3]' : '[0,3]';
    
    // remove pebble from current position
    const playerBoardPebbles = isWhite ? gameState.white.boardPebbles.filter(c => c !== pebbleCoords) : 
        gameState.black.boardPebbles.filter(c => c !== pebbleCoords);
    let playerPebbleCount = isWhite ? gameState.white.pebbleCount : gameState.black.pebbleCount;
    
    // remove other player pebble from board if it was captured
    const otherPlayBoardPebbles = isWhite ? gameState.black.boardPebbles.filter(c => c !== toCoords) : 
    gameState.white.boardPebbles.filter(c => c !== toCoords);
    const otherPlayerPebbleCount = isWhite ? gameState.black.pebbleCount : gameState.white.pebbleCount;

    // check if pebble has been moved to finish
    if(playerPebbleCount && toCoords === (isWhite ? '[0,2]' : '[2,2]'))
        playerPebbleCount -= 1;
    else
        playerBoardPebbles.push(toCoords);

    // re plenish player start pebbles if player has pebbles left
    if( (playerBoardPebbles.length < playerPebbleCount) && !playerBoardPebbles.includes(startCoords) )
        playerBoardPebbles.push(startCoords);

    // re plenish other player start pebbles if other player has pebbles left
    if( (otherPlayBoardPebbles.length < otherPlayerPebbleCount) && !otherPlayBoardPebbles.includes(otherStartCoords) )
        otherPlayBoardPebbles.push(otherStartCoords);

    // construct new states
    const player = {
        pebbleCount: playerPebbleCount,
        boardPebbles: playerBoardPebbles
    };
    const otherPlayer = {
        pebbleCount: otherPlayerPebbleCount,
        boardPebbles: otherPlayBoardPebbles
    };
    const newGameState = {
        ...gameState,
        white: isWhite ? player : otherPlayer,
        black: isWhite ? otherPlayer : player,
        whiteIsNext: isSafeSquare(toCoords) ? !gameState.whiteIsNext : gameState.whiteIsNext
    };

    return newGameState;
}