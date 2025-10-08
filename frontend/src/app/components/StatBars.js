import React from "react";
import "../styles/statbar.css";

const StatBars = ({ stats }) => {

  const maxStat = 255;

  const barColor = (value) => {
    if (value >= 120) return "#4CAF50";
    if (value >= 90) return "#FFEB3B"; 
    if (value >= 70) return "#FF9800"; 
    return "#F44336";                   
  };

  const renderBar = (label, value) => (
    <div className="stat-row" key={label}>
      <span className="stat-label">{label}:</span>
      <span className="stat-value">{value}</span>
      <div className="stat-bar">
        <div
          className="stat-fill"
          style={{
            width: `${(value / maxStat) * 100}%`,
            backgroundColor: barColor(value),
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="stat-container">
      {renderBar("HP", stats.hp)}
      {renderBar("Attack", stats.attack)}
      {renderBar("Defense", stats.defense)}
      {renderBar("Sp. Atk", stats.spAtk)}
      {renderBar("Sp. Def", stats.spDef)}
      {renderBar("Speed", stats.speed)}
    </div>
  );
};

export default StatBars;
