import blackPath from '../../assets/blackPath.png'
import whitePath from '../../assets/whitePath.png'
import capturePath from '../../assets/capturePath.png'
import rosette from '../../assets/rosette.png'

import './HowToPlay.css';

export default function HowToPlay(){

    return (
        <div className='howToPlay'>
            <h1>How to Play</h1>

            <div className='objective'>
                <h1>Objective</h1>
                <p>
                    Get all seven pieces off the board from the start before the other player
                </p>
            </div>
            
            <div className='turnBased'>
                <h1>Turn based game</h1>

                <h2>1. Roll the dice</h2>
                <p>
                    The engine roles 4 dice for you and sums up the total.

                    Each die has a 50% chance of rolling a 1 and a 50% chance of rolling a 0.

                    When the sum is 0, you're turn is skipped. Otherwise, you get to move a piece.
                </p>

                <h2>2. Move your piece</h2>
                <p>
                    You get to pick any of your pieces to move. You can only move the piece the number of squares equal to the sum you rolled.

                    You cannot move a piece onto a square that already has your piece. If it is not possible to move any pieces on your board, your turn is skipped.

                    To get the piece off the board, you have to roll a sum equal to the exact number of squares between the piece and the end.

                    The paths each player's pieces take are shown below:
                </p>
                <img src={whitePath} alt='White player path' />
                <img src={blackPath} alt='Black player path' />

                <h2>3. Capture a Piece</h2>
                <p>
                    You are able to capture your enemy's piece if you can move to the square their piece is on.

                    Capturing their piece removes it from the board and sends it back to the start.
                </p>
                <img src={capturePath} alt='Black player capturing a piece' />

                <h2>4. Rosette Squares</h2>
                <p>
                    Landing on a rosette square gives you another roll.

                    Pieces on a rosette square cannot be captured and sent back to the start.
                </p>
                <img className='logo' src={rosette} alt='Rosette square' />

            </div>
        </div>
    )
}