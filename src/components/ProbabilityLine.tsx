import React, { useState, useEffect } from 'react';

const ProbabilityLine = ({ probabilities, averageProbability, rollResult = null, isAnimating = false }) => {
  const width = 800;
  const height = 200;
  const padding = 40;
  const lineY = height - padding;
  const [animatedValue, setAnimatedValue] = useState(0);
  const [trail, setTrail] = useState([]);
  
      // Enhanced animation state with deceleration
  const [animationState, setAnimationState] = useState({
    position: 0,
    velocity: 3,
    phase: 'initial-sweep',
    fakeoutTarget: null,
    finalTarget: rollResult,
    timeAtTarget: 0,
    hasPerformedFakeout: false,
    decelerationRate: 0.98,
    minimumVelocity: 0.5
  });

  // Scale function to convert probability to x position
  const scaleX = (prob) => (prob / 100) * (width - 2 * padding) + padding;

  // Helper to generate a fake target that's notably different from the final target
  const generateFakeoutTarget = (finalTarget) => {
    const minDiff = 20; // Minimum difference from final target
    let fakeTarget;
    do {
      fakeTarget = Math.floor(Math.random() * 101);
    } while (Math.abs(fakeTarget - finalTarget) < minDiff);
    return fakeTarget;
  };

  useEffect(() => {
    if (!isAnimating) {
      setAnimatedValue(0);
      setTrail([]);
      return;
    }

    const finalTarget = rollResult || Math.floor(Math.random() * 101);
    const fakeoutTarget = generateFakeoutTarget(finalTarget);
    let currentState = {
      position: 0,
      velocity: 8, // Increased initial velocity for more dramatic slowdown
      phase: 'sweep',
      fakeoutTarget,
      finalTarget,
      timeAtTarget: 0,
      hasPerformedFakeout: false,
      decelerationRate: 0.98,
      minimumVelocity: 0.5
    };

    const interval = setInterval(() => {
      currentState = { ...currentState };
      
      switch (currentState.phase) {
        case 'sweep':
          // Initial sweeping motion with deceleration
          currentState.position += currentState.velocity;
          currentState.velocity *= currentState.decelerationRate;

          if (currentState.position >= 100 || currentState.position <= 0) {
            currentState.velocity *= -1;
          }
          
          // Transition to approaching fakeout when velocity gets low enough
          if (Math.abs(currentState.velocity) < currentState.minimumVelocity) {
            currentState.phase = 'approach-fakeout';
            // Calculate new velocity for smooth approach to fakeout
            currentState.velocity = (currentState.fakeoutTarget - currentState.position) / 40;
          }
          break;

        case 'approach-fakeout':
          // Move towards fakeout target
          currentState.position += currentState.velocity;
          if (Math.abs(currentState.position - currentState.fakeoutTarget) < 1) {
            currentState.position = currentState.fakeoutTarget;
            currentState.phase = 'settle-fakeout';
            currentState.timeAtTarget = 0;
          }
          break;

        case 'settle-fakeout':
          // Appear to settle at fakeout target
          currentState.timeAtTarget += 1;
          if (currentState.timeAtTarget > 60) { // About 1 second
            currentState.phase = 'dramatic-move';
            currentState.velocity = (currentState.finalTarget - currentState.position) / 15;
          }
          break;

        case 'dramatic-move':
          // Quick movement to final target
          currentState.position += currentState.velocity;
          if (Math.abs(currentState.position - currentState.finalTarget) < 1) {
            currentState.position = currentState.finalTarget;
            currentState.phase = 'final';
          }
          break;

        case 'final':
          // Small wobble at final position
          currentState.position = currentState.finalTarget + Math.sin(Date.now() / 100) * 0.5;
          break;
      }

      setAnimationState(currentState);
      setAnimatedValue(currentState.position);
      setTrail(prev => [...prev.slice(-4), currentState.position]);
    }, 16);

    return () => clearInterval(interval);
  }, [isAnimating, rollResult]);

  return (
    <svg width={width} height={height} className="font-sans">
      {/* Background gradient */}
      <defs>
        <linearGradient id="probabilityGradient" x1="0%" y1="0%" x2="100%" y1="0%">
          <stop offset={`${averageProbability}%`} stopColor="#86efac" />
          <stop offset={`${averageProbability}%`} stopColor="#fca5a5" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Colored background */}
      <rect 
        x={padding} 
        y={lineY - 20} 
        width={width - 2 * padding} 
        height={4} 
        fill="url(#probabilityGradient)" 
      />
      
      {/* Main line */}
      <line 
        x1={padding} 
        y1={lineY} 
        x2={width - padding} 
        y2={lineY} 
        stroke="black" 
        strokeWidth="2" 
      />
      
      {/* Ticks and labels */}
      {[0, 25, 50, 75, 100].map(tick => (
        <g key={tick}>
          <line 
            x1={scaleX(tick)} 
            y1={lineY - 5} 
            x2={scaleX(tick)} 
            y2={lineY + 5} 
            stroke="black" 
            strokeWidth="2" 
          />
          <text 
            x={scaleX(tick)} 
            y={lineY + 20} 
            textAnchor="middle" 
            className="text-sm"
          >
            {tick}%
          </text>
        </g>
      ))}
      
      {/* Individual probabilities */}
      {probabilities.map((prob, i) => (
        <g key={i}>
          <circle 
            cx={scaleX(prob)} 
            cy={lineY - 30} 
            r="4" 
            fill="black" 
          />
          <text 
            x={scaleX(prob)} 
            y={lineY - 40} 
            textAnchor="middle" 
            className="text-sm font-medium"
          >
            C{i + 1}
          </text>
        </g>
      ))}
      
      {/* Average probability marker */}
      <g>
        <line 
          x1={scaleX(averageProbability)} 
          y1={lineY - 25} 
          x2={scaleX(averageProbability)} 
          y2={lineY + 25} 
          stroke="blue" 
          strokeWidth="2" 
          strokeDasharray="4" 
        />
        <text 
          x={scaleX(averageProbability)} 
          y={lineY + 40} 
          textAnchor="middle" 
          fill="blue" 
          className="text-sm font-bold"
        >
          Average: {averageProbability.toFixed(1)}%
        </text>
      </g>
      
      {/* Animation phase indicator */}
      {isAnimating && (
        <text 
          x={padding} 
          y={padding} 
          className="text-sm"
          fill="gray"
        >
          Phase: {animationState.phase} | Value: {Math.round(animatedValue)}
        </text>
      )}
      
      {/* Animated probability marker with trail */}
      {isAnimating && animatedValue !== null && (
        <>
          {/* Trail effect */}
          {trail.map((pos, i) => (
            <circle 
              key={i}
              cx={scaleX(pos)} 
              cy={lineY} 
              r={4 + (i * 1.5)}
              fill={animationState.phase === 'dramatic-move' ? '#ef4444' : 'purple'}
              opacity={0.2 + (i * 0.1)}
            />
          ))}
          
          {/* Main marker */}
          <g filter="url(#glow)">
            <circle 
              cx={scaleX(animatedValue)} 
              cy={lineY} 
              r="8" 
              fill={animationState.phase === 'dramatic-move' ? '#ef4444' : 'purple'}
              opacity="0.9"
            >
              <animate 
                attributeName="r" 
                values="8;12;8" 
                dur="0.3s" 
                repeatCount="indefinite"
              />
            </circle>
          </g>
          <text 
            x={scaleX(animatedValue)} 
            y={lineY - 50} 
            textAnchor="middle" 
            fill={animationState.phase === 'dramatic-move' ? '#ef4444' : 'purple'}
            className="text-lg font-bold"
          >
            {Math.round(animatedValue)}%
          </text>
        </>
      )}
      
      {/* Final roll result */}
      {!isAnimating && rollResult !== null && (
        <g>
          <line 
            x1={scaleX(rollResult)} 
            y1={lineY - 25} 
            x2={scaleX(rollResult)} 
            y2={lineY + 25} 
            stroke="purple" 
            strokeWidth="2" 
          />
          <text 
            x={scaleX(rollResult)} 
            y={lineY - 50} 
            textAnchor="middle" 
            fill="purple" 
            className="text-lg font-bold"
          >
            Roll: {rollResult}%
          </text>
        </g>
      )}
    </svg>
  );
};

export default ProbabilityLine;