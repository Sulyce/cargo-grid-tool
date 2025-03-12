import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const SHIPS = {
  "RSI Zeus CL": { gridSize: 10, capacity: 128 },
  "Drake Caterpillar": { gridSize: 12, capacity: 576 },
  "MISC Hull C": { gridSize: 20, capacity: 4608 }
};

const CARGO_TYPES = [
  { id: "1x1", width: 1, height: 1, color: "blue" },
  { id: "2x1", width: 2, height: 1, color: "red" },
  { id: "2x2", width: 2, height: 2, color: "green" }
];

const CargoItem = ({ cargo, position, moveCargo }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARGO",
    item: { cargo, position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        width: `${cargo.width * 40}px`,
        height: `${cargo.height * 40}px`,
        backgroundColor: cargo.color,
        opacity: isDragging ? 0.5 : 1,
        position: "absolute",
        top: `${position.y * 40}px`,
        left: `${position.x * 40}px`,
        border: "1px solid black",
        cursor: "grab",
      }}
    ></div>
  );
};

const GridCell = ({ x, y, moveCargo }) => {
  const [, drop] = useDrop(() => ({
    accept: "CARGO",
    drop: (item) => moveCargo(item, { x, y })
  }));

  return (
    <div ref={drop} style={{ width: 40, height: 40, border: "1px solid gray" }}></div>
  );
};

const CargoGrid = () => {
  const [selectedShip, setSelectedShip] = useState(Object.keys(SHIPS)[0]);
  const [cargoItems, setCargoItems] = useState([]);

  const moveCargo = (item, newPosition) => {
    setCargoItems((prev) =>
      prev.map((cargo) =>
        cargo === item ? { ...cargo, position: newPosition } : cargo
      )
    );
  };

  const addCargo = (cargo) => {
    setCargoItems([...cargoItems, { cargo, position: { x: 0, y: 0 } }]);
  };

  const saveLayout = () => {
    localStorage.setItem(`cargoLayout-${selectedShip}`, JSON.stringify(cargoItems));
  };

  const loadLayout = () => {
    const savedLayout = JSON.parse(localStorage.getItem(`cargoLayout-${selectedShip}`));
    if (savedLayout) setCargoItems(savedLayout);
  };

  const gridSize = SHIPS[selectedShip].gridSize;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3>Select Ship</h3>
        <select onChange={(e) => setSelectedShip(e.target.value)} value={selectedShip}>
          {Object.keys(SHIPS).map((ship) => (
            <option key={ship} value={ship}>{ship}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {/* Cargo Options */}
          <div>
            <h3>Select Cargo</h3>
            {CARGO_TYPES.map((cargo) => (
              <button key={cargo.id} onClick={() => addCargo(cargo)}>
                {cargo.id}
              </button>
            ))}
            <div>
              <button onClick={saveLayout}>Save Layout</button>
              <button onClick={loadLayout}>Load Layout</button>
            </div>
          </div>

          {/* Grid Layout */}
          <div style={{ position: "relative", width: gridSize * 40, height: gridSize * 40, display: "grid", gridTemplateColumns: `repeat(${gridSize}, 40px)`, gridTemplateRows: `repeat(${gridSize}, 40px)`, border: "2px solid black" }}>
            {[...Array(gridSize)].map((_, row) =>
              [...Array(gridSize)].map((_, col) => (
                <GridCell key={`${row}-${col}`} x={col} y={row} moveCargo={moveCargo} />
              ))
            )}
            {cargoItems.map((item, index) => (
              <CargoItem key={index} cargo={item.cargo} position={item.position} moveCargo={moveCargo} />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default function App() {
  return (
    <div>
      <h1>Star Citizen Cargo Grid</h1>
      <CargoGrid />
    </div>
  );
}
