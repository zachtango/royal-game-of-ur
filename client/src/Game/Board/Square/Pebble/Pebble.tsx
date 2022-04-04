export default function Pebble({white}: {white: boolean}){
    
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
                style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px solid black',
                    backgroundColor: white ? 'white' : 'black',
                    zIndex: 1
                }}
            />
        </div>
    );
}