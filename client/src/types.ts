export interface GameState{
  white: Player,
  black: Player,
  whiteIsNext: boolean,
  dice: diceState,
  selectedPebble: coords
}

export interface moves {
  [key: coords]: coords
}

export interface Player{
    pebbleCount: number,
    boardPebbles: coords[]
  }
  
export interface Dictionary{
    [k: coords]: DictionaryEntry[]
  }
  
export interface DictionaryEntry{
    "white": coords,
    "black": coords
  }
  
export type coords = `[${number},${number}]`;
export type diceState = 0 | 1 | 2 | 3 | 4;