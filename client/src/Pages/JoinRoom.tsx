

export default function JoinRoom({joinRoom}: {joinRoom: () => void}){

    return(
        <div className='joinRoom'>
            <button onClick={() => joinRoom()}>Join</button>
        </div>
    );


}