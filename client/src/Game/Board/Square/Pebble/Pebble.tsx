import { useDrag } from 'react-dnd';

export default function Pebble({canDrag, white}: {canDrag: boolean, white: boolean}){
    const [{isDragging}, drag] = useDrag(() => ({
        type: 'Pebble',
        canDrag: canDrag,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }), [canDrag]); 
    
    return (
        <div
            ref={drag}
            style={{
                width: '100%',
                height: '100%',
                fontSize: '60px',
                cursor: 'pointer',
                opacity: isDragging ? 0.5 : 1,
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