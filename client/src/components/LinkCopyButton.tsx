import React, { useState } from 'react';
import styled from 'styled-components';
// we're using copy-to-clipboard because react-copy-to-clipboard isn't working for React 18.
import { FaCopy } from 'react-icons/fa';
import ConfirmationCheck from './ConfirmationCheck';


const CopyButton = styled.button`
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 5px;
  outline: none;
  background-color: brown;
  color: white;
  font-weight: 700;
  text-align: center;
  position: relative;

  display: flex;
  align-self: center;

  &:hover {
    cursor: pointer;
  }
`

interface Link {
  onClick: Function;
}

function LinkCopyButton(props: Link) {
  const [showBeingCopied, setShowBeingCopied] = useState<boolean>(false);

  function animateCheck() {
    setShowBeingCopied(true);
    setTimeout(() => {
      setShowBeingCopied(false);
    }, 1000)
  }

  return (
    <CopyButton onClick={() => {
      props.onClick();
      animateCheck();
    }}>
      <FaCopy style={{
        fontSize: "1.2rem",
        marginRight: "0.2rem"
      }}/>
      <div>Copy Link</div>
      <ConfirmationCheck showCheck={showBeingCopied}/>
    </CopyButton>
  )
}

export default LinkCopyButton;