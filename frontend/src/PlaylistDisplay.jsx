// frontend/src/PlaylistDisplay.jsx
import React from 'react';

const PlaylistDisplay = ({ playlist }) => {
  if (!playlist || playlist.length === 0) {
    return null;
  }

  return (
    <div className="playlist-container">
      <pre className="ascii-title-small">{`
   ▛▀▖▌  ▞▀▖▌ ▌▌  ▜▘▞▀▖▀▛▘
   ▙▄▘▌  ▙▄▌▝▞ ▌  ▐ ▚▄  ▌ 
   ▌  ▌  ▌ ▌ ▌ ▌  ▐ ▖ ▌ ▌ 
   ▘  ▀▀▘▘ ▘ ▘ ▀▀▘▀▘▝▀  ▘ 
      `}</pre>
      <div className="playlist-ascii">
        {playlist.map((track, index) => (
          <div key={index}>
            {track.title} - {track.artist}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistDisplay;