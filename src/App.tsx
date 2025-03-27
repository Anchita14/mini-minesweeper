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

//defines main react component for the game
const App = () => {
  // initialize game states -- creates grid when game states, tracks if the game is over or won
  const [grid, setGrid] = useState(generateGrid());
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);

  // reveal cell logic
  const revealCell = (row: number, col: number) => {
    //prevents revealing cell if the game is over or if a cell is already revealed
    if (gameOver || grid[row][col].isRevealed) return;

    //creates a shallow copy of grid so react detects state updates
    const newGrid = [...grid];

    //sets cell object as revealed
    newGrid[row][col].isRevealed = true;

    // checks if the revealed cell is a bomb and ends game if it is
    if (newGrid[row][col].isBomb) {
      setGameOver(true);
      return;
    }

    // checks for a win condition:  if all cells except the bomb are revealed
    let allSafeRevealed = true;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j].isRevealed) {
          allSafeRevealed = false;
        }
      }
    }

    //if game is won, then set the game to won and end it
    if (allSafeRevealed) {
      setGameWin(true);
      setGameOver(true);
    }

    setGrid(newGrid);
  };

  const renderGrid = () => {
    //prevent errors if the grid isn't defined
    if (!grid || grid.length === 0) return null;

    //loops through grid and creates a <div> for each cell
    const rows = [];
    for (let i = 0; i < gridSize; i++) {
      const rowCells = [];
      for (let j = 0; j < gridSize; j++) {
        const cell = grid[i][j];
        rowCells.push(
            <div
                //creates a unique key for each cell and sets the style for a revealed cell
                key={`${i}-${j}`}
                className={`cell ${cell.isRevealed ? 'revealed' : ''}`}
                onClick={() => revealCell(i, j)}
            >
              //if the cell is a bomb, displays a bomb emoji
              {cell.isRevealed ? (cell.isBomb ? '💣' : '') : ''}
            </div>
        );
      }
      //groups each row into a div
      rows.push(
          <div key={i} className="row">
            {rowCells}
          </div>
      );
    }
    return rows;
  };

  return (
      //displays if you win or if the game is over and then generates a new board whenever
      // reset game is called
      <div className="App">
        <h1>Mini Minesweeper</h1>
        {gameOver && <h2>{gameWin ? 'You Win!' : 'Game Over!'}</h2>}
        <div className="grid">{renderGrid()}</div>
        <button onClick={() => {
          setGrid(generateGrid()); // Generate a new grid
          setGameOver(false);      // Reset game over state
          setGameWin(false);       // Reset game win state
        }}>
          Reset Game
        </button>
      </div>
  );
};

export default App;


