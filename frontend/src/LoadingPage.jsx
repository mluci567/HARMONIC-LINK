// frontend/src/LoadingPage.jsx
import React from 'react';

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <div className="video-container">
        <video autoPlay loop muted playsInline className="loading-video">
          <source src="/LoadingVid.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="loading-overlay">
      </div>
    </div>
  );
};

export default LoadingPage;