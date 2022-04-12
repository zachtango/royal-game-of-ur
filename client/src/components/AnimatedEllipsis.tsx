import React, { useEffect, useState } from 'react';

function AnimatedEllipsis() {
  const [showIndex, setShowIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowIndex(showIndex => showIndex == 3 ? 0 : showIndex + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    {[...Array(3)].map((u, i) => (
      <span key={i} style={{
        opacity: i < showIndex ? 1 : 0
      }}>.</span>
    ))}
    </>
  )
}

export default AnimatedEllipsis;