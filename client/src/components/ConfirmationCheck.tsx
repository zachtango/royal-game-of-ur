import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';

const checkUp = keyframes`
  from {
    transform: translateY(0em);
    opacity: 1;
  } to {
    transform: translateY(-1em);
    opacity: 0;
  }
`

interface CheckProps {
  showCheck: boolean
}

const StyledCheck = styled(FaCheckCircle)<CheckProps>`
  color: lightgreen;
  font-size: 2em;
  animation: ${checkUp} 1s forwards;
  position: absolute;
  bottom: -0.75em;
  right: -0.75em;

  ${props => !props.showCheck && `
    display: none;
  `}
`

interface ConfirmationCheckProps {
  showCheck: boolean
}

function ConfirmationCheck(props: ConfirmationCheckProps) {
  return (
    <StyledCheck showCheck={props.showCheck} />
  )
}

export default ConfirmationCheck;