// frontend/src/PathDisplay.jsx
import React from 'react';

const PathDisplay = ({ path }) => {
  if (!path || path.length === 0) {
    return null;
  }

  return (
    <div className="results-container">
      <pre className="ascii-title-small">{`
    ▀▛▘▌ ▌▛▀▘ ▛▀▖▞▀▖▀▛▘▌ ▌ 
     ▌ ▙▄▌▙▄  ▙▄▘▙▄▌ ▌ ▙▄▌ 
     ▌ ▌ ▌▌   ▌  ▌ ▌ ▌ ▌ ▌ 
     ▘ ▘ ▘▀▀▘ ▘  ▘ ▘ ▘ ▘ ▘ 
      `}</pre>
      <div className="path-ascii-art">
        {path.map((step, index) => (
          <div key={index} className="path-step-vertical">
            <div className="artist-text">{`[ ${step.name} ]`}</div>
            {index < path.length - 1 && (
              <>
                <div className="arrow-down">|</div>
                <div className="link-text">{path[index + 1].link}</div>
                <div className="arrow-down">↓</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathDisplay;