import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../colors';
import copy from 'copy-to-clipboard';

import LinkCopyButton from '../components/LinkCopyButton';
import ConfirmationCheck from '../components/ConfirmationCheck';
import AnimatedEllipsis from '../components/AnimatedEllipsis';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Link = styled.span`
  font-weight: bold;
  color: ${colors.darkAccent};
  position: relative;
  margin-bottom: 40px;

  &:hover {
    cursor: pointer;
  }
`

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* background-color: #e3dac9; */
  /* border: 10px solid ${colors.accent}; */
  padding: 30px;
  border-radius: 15px;
  position: relative;

  &:before {
    content: '';
    width: 100vw;
    background-color: #e3dac9;
    height: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`

function Waiting() {
  const [showBeingCopied, setShowBeingCopied] = useState<boolean>(false);

  function copyLink() {
    copy(window.location.href);
  }
  function animateCheck() {
    setShowBeingCopied(true);
    setTimeout(() => {
      setShowBeingCopied(false);
    }, 1000);
  }

  return(
    <Container>
      <h1>Share this link with the other player!</h1>
      <div>
      <SubContainer>
        <Link onClick={() => {
          copyLink();
          animateCheck();
        }}
          title="Copy Link"
        >{window.location.href}
          <ConfirmationCheck showCheck={showBeingCopied} />
        </Link>
      <LinkCopyButton onClick={copyLink} />
      </SubContainer>
      <h1 style={{textAlign: "right"}}>Waiting<AnimatedEllipsis /></h1>
      </div>
    </Container>
  )
}

export default Waiting;