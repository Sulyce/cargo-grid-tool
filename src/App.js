import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const GRID_SIZE = 10; // Define a 10x10 grid for testing
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Cargo Options */}
        <div>
          <h3>Select Cargo</h3>
          {CARGO_TYPES.map((cargo) => (
            <button key={cargo.id} onClick={() => addCargo(cargo)}>
              {cargo.id}
            </button>
          ))}
        </div>

        {/* Grid Layout */}
        <div style={{ position: "relative", width: GRID_SIZE * 40, height: GRID_SIZE * 40, display: "grid", gridTemplateColumns: `repeat(${GRID_SIZE}, 40px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 40px)`, border: "2px solid black" }}>
          {[...Array(GRID_SIZE)].map((_, row) =>
            [...Array(GRID_SIZE)].map((_, col) => (
              <GridCell key={`${row}-${col}`} x={col} y={row} moveCargo={moveCargo} />
            ))
          )}
          {cargoItems.map((item, index) => (
            <CargoItem key={index} cargo={item.cargo} position={item.position} moveCargo={moveCargo} />
          ))}
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
