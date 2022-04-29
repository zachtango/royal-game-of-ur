export interface GameState{
    white: Player,
    black: Player,
    whiteIsNext: boolean,
    dice: diceState
  }

export interface Player{
    pebbleCount: number,
    boardPebbles: coords[]
}

export type playerColor = "white" | "black";

export type coords = `[${number},${number}]`;
export type diceState = 0 | 1 | 2 | 3 | 4;

export interface moves {
  [key: coords]: coords
}
