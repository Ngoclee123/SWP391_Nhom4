import React from 'react';
import '../styles/loadingAnimation.css';

const LoadingAnimation = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="health-icon-container">
          {/* Hospital Cross Icon */}
          <div className="hospital-cross">
            <div className="cross-vertical"></div>
            <div className="cross-horizontal"></div>
          </div>
          
          {/* Heartbeat Line */}
          <div className="heartbeat-line">
            <svg viewBox="0 0 600 100" width="180" height="60">
              <polyline
                className="heartbeat"
                points="0,50 100,50 130,30 160,70 190,40 220,80 250,30 280,70 310,40 340,50 600,50"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingAnimation; 