import './PlayerInfo.css';

interface Props{
    turn: boolean,
    text: string,
    pebbleNum: number
}

export default function PlayerInfo({turn, text, pebbleNum}: Props){
    const pebbles = [];
    for(let i = 0; i < pebbleNum; i++){
        pebbles.push(<div className='circle circleBlack' />)
    }
    return (
        <div className="player-info">
            <div className="row">
                <div>Anonymous</div>
                {turn && <p>{text}</p>}
            </div>
            <div 
                className="pebbleContainer"
            >
                {pebbles}
            </div>
        </div>
    );
}