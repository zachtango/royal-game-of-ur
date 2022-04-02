import type { coords } from "../types";

export function isSafeSquare(coords: coords): boolean{
    const r = parseInt(coords[1]), c = parseInt(coords[3]);
    return ( ( (r === 0 || r === 2) && (c === 1 || c === 7) ) || ( r === 1 && c === 4 ) );
}

export function isNonSquare(coords: coords): boolean{
    const r = parseInt(coords[1]), c = parseInt(coords[3]);
    return ( (r === 0 || r === 2) && (c === 2 || c === 3) );
}