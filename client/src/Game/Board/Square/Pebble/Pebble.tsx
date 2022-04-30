import './Pebble.css';

interface Props{
    white: boolean,
    canMoveTo: boolean
}

export default function Pebble({white, canMoveTo}: Props){
    
    return (
        <div
            
            style={{
                width: '100%',
                height: '100%',
                fontSize: '60px',
                cursor: 'pointer',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <div 
                className={`${canMoveTo && 'capture-pebble'}`}
                style={{
                    width: '60%',
                    height: '60%',
                    borderRadius: '50%',
                    border: '2px solid black',
                    backgroundColor: white ? 'white' : 'black',
                    zIndex: 1
                }}
            />
        </div>
    );
}