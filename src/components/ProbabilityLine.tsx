import React from 'react';

const ProbabilityLine = ({ probabilities, averageProbability, rollResult = null }) => {
  const width = 800;
  const height = 200;
  const padding = 40;
  const lineY = height - padding;
  
  // Scale function to convert probability to x position
  const scaleX = (prob) => (prob / 100) * (width - 2 * padding) + padding;
  
  return (
    <svg width={width} height={height} className="font-sans">
      {/* Background gradient */}
      <defs>
        <linearGradient id="probabilityGradient" x1="0%" y1="0%" x2="100%" y1="0%">
          <stop offset={`${averageProbability}%`} stopColor="#86efac" />
          <stop offset={`${averageProbability}%`} stopColor="#fca5a5" />
        </linearGradient>
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
      
      {/* Roll result */}
      {rollResult !== null && (
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
            className="text-sm font-bold"
          >
            Roll: {rollResult}%
          </text>
        </g>
      )}
    </svg>
  );
};

export default ProbabilityLine;