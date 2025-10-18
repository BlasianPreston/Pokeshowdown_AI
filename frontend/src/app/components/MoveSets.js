import React from "react";
import "../styles/movesets.css";

const Movesets = ({ data }) => {
  return (
    <div className="movesets-container">
      <h1 className="title">Movesets</h1>
      <div className="cards-grid">
        {data.map((setData, index) => (
          <div key={index} className="moveset-card">
            <h2 className="set-name">{setData.set}</h2>
            <div className="moves-list">
              {setData.moves.map((move, i) => (
                <div key={i} className="move-slot">
                  <span className="move-number">Move {i + 1}:</span> {move}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movesets;
