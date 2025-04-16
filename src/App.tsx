import React, { useState, useEffect } from "react";
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
  //row: Math.floor(Math.random() * gridSize),
  //col: Math.floor(Math.random() * gridSize),
  row: 0,
  col: 0,
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
const App = ({ exposeBombs = false }) => {
  // initializes bomb location, game states, and creates the grid
  const [bombLocation, setBombLocation] = useState(generateBombLocation());
  const [grid, setGrid] = useState(() => generateGrid(bombLocation));
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false); // controls if reset popup is shown
  const [wins, setWins] = useState<number | 0>(0);
  const [losses, setLosses] = useState<number | 0>(0);


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
      setLosses((prev) => prev + 1); // increment losses
      setCountdown(5); // Start countdown if game is over
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
      setWins((prev) => prev + 1); // increment wins
      setCountdown(5); // Start countdown if game is won
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
    setCountdown(null); // Reset countdown
    setShowResetConfirm(false); // hide the confirmation popup
  };

  // Automatically restart the game after 5 seconds when game is over
  useEffect(() => {
    if (countdown === null) return; // if countdown is not running, do nothing

    if (countdown > 0) {
      // wait 1 sec before reducing countdown by 1
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      // cleanup timer to avoid memory leaks
      return () => clearTimeout(timer);
    } else {
      // once the countdown hits 0, the game resets
      resetGame();
    }
  }, [countdown]);

  // function for left side section of game rules
  const renderSidebarRules = () => (
      <div className="Sidebar rules">
        <h2>Game Rules</h2>
        <ul>
          <li>Click on a tile to reveal it</li>
          <li>Avoid the 💣</li>
          <li>Reveal all the safe cells to win</li>
        </ul>
      </div>
  );

  // function for popup feature of game -- checks for game over and reset before proceeding
  // for a new game -- includes popup implementation
  const renderPopup = () => {
    if (!(gameOver || showResetConfirm)) return null;

    return (
        <div className="popup">
          <div className="popup-content">
            {showResetConfirm ? (
                <>
                  <h2>🔄 Reset Game?</h2>
                  <p>This will start a new game. Are you sure you want to continue?</p>
                  <button onClick={resetGame}>Yes</button>
                  <button onClick={() => setShowResetConfirm(false)}>No</button>
                </>
            ) : (
                <>
                  <h2>{gameWin ? "🎉 You Win!" : "💥 Game Over!"}</h2>
                  <p>Game restarting in {countdown}...</p>
                </>
            )}
          </div>
        </div>
    );
  };

  // function for right side section of scoreboard -- adds up wins and losses for games
  const renderSidebarScoreboard = () => (
      <div className="Sidebar scoreboard">
        <h2>Scoreboard</h2>
        <p>🎉 Wins: {wins}</p>
        <p>💥 Losses: {losses}</p>
      </div>
  );

  // function for grid logic -- checks for revealed cells and bombs
  const renderGrid = () => (
      <div className="grid">
        {grid.map((row, i) =>
            row.map((cell, j) => (
                <div
                    key={`${i}-${j}`}
                    data-testid={cell.isBomb && exposeBombs ? "bomb" : undefined}
                    data-cell-id={`${i}-${j}`}
                    className={`cell ${cell.isRevealed ? (cell.isBomb ? "bomb revealed" : "revealed") : ""}`}
                    onClick={() => revealCell(i, j)}
                >
                  {cell.isRevealed ? (cell.isBomb ? "💣" : "") : ""}
                </div>
            ))
        )}
      </div>
  );


  return (
      // displays if you win or if the game is over and then generates a new board whenever
      // reset game is called and also adds game rules and a scoreboard to both sides of the grid
      // and it uses multiple functions for each section of the screen
      <div className="AppContainer">
        {renderSidebarRules()}
        <div className="App">
          <h1>Mini Minesweeper</h1>
          {renderPopup()}
          {renderGrid()}
          <button onClick={() => setShowResetConfirm(true)}>🔄 Reset Game</button>
        </div>
        {renderSidebarScoreboard()}
      </div>
  );
};

export default App;


