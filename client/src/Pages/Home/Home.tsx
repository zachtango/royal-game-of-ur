import {useContext} from 'react'

import { Link } from 'react-router-dom';
import gameContext from '../../Game/GameContext/gameContext';

import {AiFillRobot} from 'react-icons/ai'
import {BsPersonFill, BsFillQuestionCircleFill} from 'react-icons/bs'

import rosette from '../../assets/rosette.png';

import './Home.css'

export default function Home(){
    const {
        roomId
    } = useContext(gameContext)

    const options = ['How to play', 'Play a friend', 'Play a bot']

    return (
        <div className='homePage'>
            <div>
                <div className='title'>
                    <img className='logo' src={rosette} alt='logo' />
                    <h1>Royal Game of Ur</h1>
                </div>


                <div className='options'>
                    <div
                        className='option'
                    >
                        <Link 
                            to={{pathname: '/how-to-play'}} 
                            title={options[0]} 
                        >
                            <BsFillQuestionCircleFill />
                        </Link>
                    </div>
                    
                    <div
                        className='option'
                    >
                        <Link 
                            to={{pathname: '/', search: `?roomId=${roomId}`}} 
                            title={options[1]}
                        >
                            <BsPersonFill />
                        </Link>
                    </div>

                    <div title={'Coming soon (play a bot)'} className='option robot'>
                        <AiFillRobot />
                    </div>
                </div>
            </div>
        </div>
    )
}
