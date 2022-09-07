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
                    <h1>Royal Game of Ur test</h1>
                </div>

                <div>
                    <div className='options'>
                        <Link 
                            to={{pathname: '/how-to-play'}} 
                            title={options[0]} 
                            className='option'
                        >
                            <BsFillQuestionCircleFill />
                        </Link>

                        <Link 
                            to={{pathname: '/', search: `?roomId=${roomId}`}} 
                            title={options[1]} 
                            className='option'
                        >
                            <BsPersonFill />
                        </Link>

                        <div title={'Coming soon (play a bot)'} className='option robot'>
                            <AiFillRobot />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}