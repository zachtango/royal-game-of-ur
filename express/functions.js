const MoveDictionary = require('./moveDictionary.json');

function isSafeSquare(coords){
    const r = parseInt(coords[1]), c = parseInt(coords[3]);
    return ( ( (r === 0 || r === 2) && (c === 1 || c === 7) ) || ( r === 1 && c === 4 ) );
}

function rollDice(){
    let counter = 0;
  
    for(let i = 0; i < 4; i++){
      counter += Math.floor(Math.random() * 2);
    }
  
    console.log(counter);
    return counter;
}

const canMovePebble = (pebbleCoords, whiteIsNext, dice, playerBoardPebbles, otherPlayerBoardPebbles) => {

    const moveCoords = MoveDictionary[pebbleCoords][dice - 1][whiteIsNext ? "white" : "black"];

    // fixme include issafesquare
    return moveCoords !== '[-1,-1]' && !playerBoardPebbles.includes(moveCoords) && !(otherPlayerBoardPebbles.includes(moveCoords) && isSafeSquare(moveCoords)) ? moveCoords : '[-1,-1]';
}

module.exports = {
    rollDice,
    canMovePebble
}