import React, { useState } from "react";
import "./App.css";

//defines the cell type with variables for if it is a bomb or if it has been revealed by the user
type Cell = {
  isBomb: boolean;
  isRevealed: boolean;
};

// game grid size for 5x5
const gridSize = 5;

// function to generate a random bomb location
const generateBombLocation = () => ({
  row: Math.floor(Math.random() * gridSize),
  col: Math.floor(Math.random() * gridSize),
});

// initializes a game board using a 2d array filled with cell objects using nested
// loops which are set to default cell objects for now
const generateGrid = (bombLocation: { row: number; col: number }) => {
  const newGrid: Cell[][] = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      newGrid[i][j] = {
        isBomb: i === bombLocation.row && j === bombLocation.col,
        isRevealed: false
      };
    }
  }
  //return the final grid
  return newGrid;
};

//defines main react component for the game
const App = () => {
  // initializes bomb location, game states, and creates the grid
  const [bombLocation, setBombLocation] = useState(generateBombLocation());
  const [grid, setGrid] = useState(() => generateGrid(bombLocation));
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
        if (!newGrid[i][j].isRevealed && !newGrid[i][j].isBomb) {
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

  // function to reset the game
  const resetGame = () => {
    // generates a new bomb location
    const newBombLocation = generateBombLocation();
    setBombLocation(newBombLocation);
    setGrid(generateGrid(newBombLocation)); // creates a new grid with the new bomb location
    setGameOver(false);
    setGameWin(false);
  };

  return (
      //displays if you win or if the game is over and then generates a new board whenever
      // reset game is called
      <div className="App">
        <h1>Mini Minesweeper</h1>
        {gameOver && <h2>{gameWin ? "You Win!" : "Game Over!"}</h2>}
        <div className="grid">
          {grid.map((row, i) =>
              row.map((cell, j) => (
                  <div
                      //creates a unique key for each cell and sets the style for a revealed cell
                      key={`${i}-${j}`}
                      className={`cell ${cell.isRevealed ? (cell.isBomb ? "bomb revealed" : "revealed") : ""}`}
                      onClick={() => revealCell(i, j)}
                  >
                    {cell.isRevealed ? (cell.isBomb ? "💣" : "") : ""}
                  </div>
              ))
          )}
        </div>
        <button onClick={resetGame}>Reset Game</button>
      </div>
  );
};

export default App;



