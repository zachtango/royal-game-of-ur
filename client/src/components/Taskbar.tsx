import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import rosette from '../assets/rosette.png';

const Nav = styled.nav`

`

const NavImg = styled.img`
    margin-top: 20px;
    width: 70px;
    height: 65px;
`

export default function Taskbar(){

    return(
        <Nav>
            <NavImg className="logo" src={rosette} alt="logo"/>
        </Nav>
    );
}