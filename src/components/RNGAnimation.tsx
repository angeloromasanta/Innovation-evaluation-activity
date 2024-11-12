// components/RNGAnimation.tsx
import React, { useEffect, useState } from 'react';

interface RNGAnimationProps {
  onComplete: (result: boolean) => void;
  probability: number;
}

const RNGAnimation: React.FC<RNGAnimationProps> = ({
  onComplete,
  probability,
}) => {
  const [counter, setCounter] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCounter(Math.floor(Math.random() * 100));
    }, 50);

    const timeout = setTimeout(() => {
      setIsAnimating(false);
      const result = Math.random() * 100 <= probability;
      onComplete(result);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAnimating, probability, onComplete]);

  return (
    <div className="text-center p-8">
      <div className="text-6xl font-bold mb-4">{counter}%</div>
      {!isAnimating && (
        <div className="text-2xl font-bold">
          {counter <= probability ? 'Success!' : 'Failed!'}
        </div>
      )}
    </div>
  );
};

export default RNGAnimation;
