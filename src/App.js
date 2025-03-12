import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const SHIPS = {
  "RSI Zeus CL": { gridSize: 10, capacity: 128 },
  "Drake Caterpillar": { gridSize: 12, capacity: 576 },
  "MISC Hull C": { gridSize: 20, capacity: 4608 }
};

const CONTAINER_TYPES = [
  { id: "1 SCU", width: 1, height: 1, depth: 1, color: "blue" },
  { id: "2 SCU", width: 2, height: 1, depth: 1, color: "red" },
  { id: "4 SCU", width: 2, height: 2, depth: 1, color: "green" },
  { id: "8 SCU", width: 2, height: 2, depth: 2, color: "yellow" },
  { id: "16 SCU", width: 4, height: 2, depth: 2, color: "purple" },
  { id: "24 SCU", width: 6, height: 2, depth: 2, color: "orange" },
  { id: "32 SCU", width: 8, height: 2, depth: 2, color: "pink" }
];

const ContainerItem = ({ container, position, moveContainer }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CONTAINER",
    item: { id: container.id, width: container.width, height: container.height, position },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        moveContainer(item, dropResult.position);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        width: `${container.width * 40}px`,
        height: `${container.height * 40}px`,
        backgroundColor: container.color,
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

const GridCell = ({ x, y, moveContainer, isOccupied }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CONTAINER",
    drop: (item) => ({ position: { x, y } }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
    canDrop: () => !isOccupied,
  }));

  return (
    <div
      ref={drop}
      style={{
        width: 40,
        height: 40,
        border: "1px solid gray",
        backgroundColor: isOver && !isOccupied ? "lightgreen" : isOccupied ? "red" : "transparent",
      }}
    ></div>
  );
};

const ContainerGrid = () => {
  const [selectedShip, setSelectedShip] = useState(Object.keys(SHIPS)[0]);
  const [containerItems, setContainerItems] = useState([]);

  const isSpaceOccupied = (x, y, width, height) => {
    return containerItems.some((c) =>
      x < c.position.x + c.width && x + width > c.position.x &&
      y < c.position.y + c.height && y + height > c.position.y
    );
  };

  const moveContainer = (item, newPosition) => {
    if (!isSpaceOccupied(newPosition.x, newPosition.y, item.width, item.height)) {
      setContainerItems((prev) =>
        prev.map((c) =>
          c.id === item.id ? { ...c, position: newPosition } : c
        )
      );
    }
  };

  const addContainer = (container) => {
    if (!isSpaceOccupied(0, 0, container.width, container.height)) {
      setContainerItems([...containerItems, { ...container, position: { x: 0, y: 0 } }]);
    }
  };

  const saveLayout = () => {
    localStorage.setItem(`containerLayout-${selectedShip}`, JSON.stringify(containerItems));
  };

  const loadLayout = () => {
    const savedLayout = JSON.parse(localStorage.getItem(`containerLayout-${selectedShip}`));
    if (savedLayout) setContainerItems(savedLayout);
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
          <div>
            <h3>Select Container</h3>
            {CONTAINER_TYPES.map((container) => (
              <button key={container.id} onClick={() => addContainer(container)}>
                {container.id}
              </button>
            ))}
            <div>
              <button onClick={saveLayout}>Save Layout</button>
              <button onClick={loadLayout}>Load Layout</button>
            </div>
          </div>
          <div style={{ position: "relative", width: gridSize * 40, height: gridSize * 40, display: "grid", gridTemplateColumns: `repeat(${gridSize}, 40px)`, gridTemplateRows: `repeat(${gridSize}, 40px)`, border: "2px solid black" }}>
            {[...Array(gridSize)].map((_, row) =>
              [...Array(gridSize)].map((_, col) => (
                <GridCell key={`${row}-${col}`} x={col} y={row} moveContainer={moveContainer} isOccupied={isSpaceOccupied(col, row, 1, 1)} />
              ))
            )}
            {containerItems.map((item, index) => (
              <ContainerItem key={index} container={item} position={item.position} moveContainer={moveContainer} />
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
      <h1>Star Citizen Container Grid</h1>
      <ContainerGrid />
    </div>
  );
}