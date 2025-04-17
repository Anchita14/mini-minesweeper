import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// defines the cell type with variables for if it is a bomb or if it has been revealed by the user
type Cell = {
  isBomb: boolean;
  isRevealed: boolean;
};

// game grid size for 5x5
const defaultGridSize = 5;

// function to generate a random bomb location
const generateBombLocation = (gridSize: number) => ({
  row: Math.floor(Math.random() * gridSize),
  col: Math.floor(Math.random() * gridSize),
});

// initializes a game board using a 2d array filled with cell objects using nested
// loops which are set to default cell objects for now
const generateGrid = (gridSize: number, bombLocation: { row: number; col: number }) => {
  const newGrid: Cell[][] = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      newGrid[i][j] = {
        isBomb: i === bombLocation.row && j === bombLocation.col,
        isRevealed: false,
      };
    }
  }
  return newGrid;
};

// defines main react component for the game
const App = ({
               exposeBombs = false,
               initialBombLocation,
               initialGridSize,
             }: {
  exposeBombs?: boolean;
  initialBombLocation?: { row: number; col: number };
  initialGridSize?: number;
}) => {

  const [gridSize, setGridSize] = useState(initialGridSize ?? defaultGridSize);
  const [bombLocation, setBombLocation] = useState(
      initialBombLocation ?? generateBombLocation(initialGridSize ?? defaultGridSize)
  );
  const [grid, setGrid] = useState(() => generateGrid(gridSize, bombLocation));
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [wins, setWins] = useState<number | 0>(0);
  const [losses, setLosses] = useState<number | 0>(0);

  // reveal cell logic
  const revealCell = (row: number, col: number) => {
    if (gameOver || grid[row][col].isRevealed) return;
    const newGrid = [...grid];
    newGrid[row][col].isRevealed = true;

    if (newGrid[row][col].isBomb) {
      setGameOver(true);
      setLosses((prev) => prev + 1);
      setCountdown(5);
      return;
    }

    let allSafeRevealed = true;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j].isRevealed && !newGrid[i][j].isBomb) {
          allSafeRevealed = false;
        }
      }
    }

    if (allSafeRevealed) {
      setGameWin(true);
      setGameOver(true);
      setWins((prev) => prev + 1);
      setCountdown(5);
    }

    setGrid(newGrid);
  };

  const resetGame = useCallback(() => {
    const newBombLocation = generateBombLocation(gridSize);
    setBombLocation(newBombLocation);
    setGrid(generateGrid(gridSize, newBombLocation));
    setGameOver(false);
    setGameWin(false);
    setCountdown(null);
    setShowResetConfirm(false);
  }, [gridSize]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      resetGame();
    }
  }, [countdown, resetGame]);

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

  const renderSidebarScoreboard = () => (
      <div className="Sidebar scoreboard">
        <h2>Scoreboard</h2>
        <p>🎉 Wins: {wins}</p>
        <p>💥 Losses: {losses}</p>
      </div>
  );

  const renderGrid = () => (
      <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 90px)`,
            gridTemplateRows: `repeat(${gridSize}, 90px)`,
          }}
      >
        {grid.map((row, i) =>
            row.map((cell, j) => (
                <div
                    key={`${i}-${j}`}
                    data-testid={`${i}-${j}`}
                    data-bomb-testid={cell.isBomb && exposeBombs ? "bomb" : undefined}
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

  const renderControls = () => (
      <div className="controls">
        <button onClick={() => setShowResetConfirm(true)}>🔄 Reset Game</button>
        <div className="dropdown">
          <label>Difficulty:&nbsp;</label>
          <select
              value={gridSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10);
                setGridSize(newSize);
                const newBombLocation = generateBombLocation(newSize);
                setBombLocation(newBombLocation);
                setGrid(generateGrid(newSize, newBombLocation));
                setGameOver(false);
                setGameWin(false);
                setCountdown(null);
                setShowResetConfirm(false);
              }}
          >
            <option value={3}>3 x 3 (Easy)</option>
            <option value={5}>5 x 5 (Medium)</option>
            <option value={7}>7 x 7 (Hard)</option>
          </select>
        </div>
      </div>
  );

  return (
      <div className="AppContainer">
        {renderSidebarRules()}
        <div className="App">
          <h1>Mini Minesweeper</h1>
          {renderPopup()}
          {renderGrid()}
          {renderControls()}
        </div>
        {renderSidebarScoreboard()}
      </div>
  );
};

export default App;

