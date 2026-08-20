import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

const SalesTarget = () => {
  return (
    <>
      <div className="card-header">
        <h3>Sales Target</h3>
      </div>
      <div className="radial-chart-container">
        {/* Static SVG for the radial chart */}
        <svg viewBox="0 0 100 100" width="150" height="150">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="8"></circle>
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary-color-light)" strokeWidth="8" strokeDasharray="283" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 50 50)"></circle>
          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--primary-color)" strokeWidth="8" strokeDasharray="220" strokeDashoffset="70" strokeLinecap="round" transform="rotate(-90 50 50)"></circle>
        </svg>
      </div>
      <div className="target-details">
        <div className="target-item">
          <span className="dot down"></span>
          <div>
            <p>Daily Target</p>
            <span className="change down"><ArrowDown size={16}/> 650</span>
          </div>
        </div>
        <div className="target-item">
          <span className="dot up"></span>
          <div>
            <p>Monthly Target</p>
            <span className="change up"><ArrowUp size={16}/> 145,00</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesTarget;