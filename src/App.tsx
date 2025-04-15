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
const App = ({ exposeBombs = false }) => {
  // initializes bomb location, game states, and creates the grid
  const [bombLocation, setBombLocation] = useState(generateBombLocation());
  const [grid, setGrid] = useState(() => generateGrid(bombLocation));
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false); // controls if reset popup is shown

  // initializes win/loss score and stores in localStorage
  const [wins, setWins] = useState(() => Number(localStorage.getItem("wins")) || 0);
  const [losses, setLosses] = useState(() => Number(localStorage.getItem("losses")) || 0);

  // update localStorage when wins or losses change
  useEffect(() => {
    localStorage.setItem("wins", wins.toString());
  }, [wins]);

  useEffect(() => {
    localStorage.setItem("losses", losses.toString());
  }, [losses]);

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

  return (
      //displays if you win or if the game is over and then generates a new board whenever
      // reset game is called and also adds game rules and a scoreboard to both sides of the grid
      <div className="AppContainer">
        {/* left side section -- provides game rules */}
        <div className="Sidebar rules">
          <h2>Game Rules</h2>
          <ul>
            <li>Click on a tile to reveal it</li>
            <li>Avoid the 💣</li>
            <li>Reveal all the safe cells to win</li>
          </ul>
        </div>

        <div className="App">
          {/* main header and game -- checks for game over and reset before proceeding
          for a new game -- implementation of reset game button and countdown included */}
          <h1>Mini Minesweeper</h1>
          {(gameOver || showResetConfirm) && (
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
          )}

          {/* grid section -- checks for revealed cells */}
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
          <button onClick={() => setShowResetConfirm(true)}>🔄 Reset Game</button>
        </div>

        {/* right side section -- adds up wins and losses for games */}
        <div className="Sidebar scoreboard">
          <h2>Scoreboard</h2>
          <p>🎉 Wins: {wins}</p>
          <p>💥 Losses: {losses}</p>
        </div>
      </div>
  );
};

export default App;


