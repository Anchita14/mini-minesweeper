import React, { useState } from 'react';
import './App.css';

//defines the cell type with variables for if it is a bomb or if it has been revealed by the user
type Cell = {
  isBomb: boolean;
  isRevealed: boolean;
};

// game grid size for 5x5
const gridSize = 5;

// initializes a game board using a 2d array filled with cell objects using nested
// loops which are set to default cell objects for now
const generateGrid = () => {
  const newGrid: Cell[][] = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      newGrid[i][j] = { isBomb: false, isRevealed: false };
    }
  }

  // uses math random to randomly select a column and row to place one bomb and set that cell
  // as a bomb cell object
  const bombRow = Math.floor(Math.random() * gridSize);
  const bombCol = Math.floor(Math.random() * gridSize);
  newGrid[bombRow][bombCol].isBomb = true;

  //return the final grid
  return newGrid;
};


const App = () => {
  // Initialize the grid immediately
  const [grid, setGrid] = useState(generateGrid());
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // Reveal cell logic
  const revealCell = (row: number, col: number) => {
    if (gameOver || grid[row][col].isRevealed) return;
    const newGrid = [...grid];
    newGrid[row][col].isRevealed = true;

    // Check if bomb is clicked
    if (newGrid[row][col].isBomb) {
      setGameOver(true);
      return;
    }

    // Check for win condition: all non-bomb cells revealed
    let allSafeRevealed = true;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j].isBomb && !newGrid[i][j].isRevealed) {
          allSafeRevealed = false;
        }
      }
    }

    if (allSafeRevealed) {
      setWin(true);
      setGameOver(true);
    }

    setGrid(newGrid);
  };

  // Ensure grid is defined before rendering
  const renderGrid = () => {
    if (!grid || grid.length === 0) return null; // Prevent rendering errors

    const rows = [];
    for (let i = 0; i < gridSize; i++) {
      const rowCells = [];
      for (let j = 0; j < gridSize; j++) {
        const cell = grid[i][j];
        rowCells.push(
            <div
                key={`${i}-${j}`}
                className={`cell ${cell.isRevealed ? 'revealed' : ''}`}
                onClick={() => revealCell(i, j)}
            >
              {cell.isRevealed ? (cell.isBomb ? '💣' : '') : ''}
            </div>
        );
      }
      rows.push(
          <div key={i} className="row">
            {rowCells}
          </div>
      );
    }
    return rows;
  };

  return (
      <div className="App">
        <h1>Mini Minesweeper</h1>
        {gameOver && <h2>{win ? 'You Win!' : 'Game Over!'}</h2>}
        <div className="grid">{renderGrid()}</div>
        <button onClick={() => setGrid(generateGrid())}>Reset Game</button>
      </div>
  );
};

export default App;


