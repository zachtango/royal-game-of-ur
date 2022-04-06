import React from 'react';
import { Link } from 'react-router-dom';

import rosette from '../assets/rosette.png';

export default function Taskbar(){

    return(
        <nav>
            <img className="logo" src={rosette} alt="logo"/>
          
        </nav>
    );
}