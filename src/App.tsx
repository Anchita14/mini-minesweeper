// usestate: declaring state variables in functional component
// useeffect: handling side effects
// usecallback: memorizes functions to prevent uncessary re-rendering
import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// defines a typescript type for each grid cell which has variables for whether the cell is a
// bomb or if it has been revealed
type Cell = {
  isBomb: boolean;
  isRevealed: boolean;
};

// default grid size if no size is passed in
const defaultGridSize = 5;

// function to generate a random bomb location within the grid bounds
const generateBombLocation =
    (gridSize: number) => ({
  row: Math.floor(Math.random() * gridSize),
  col: Math.floor(Math.random() * gridSize),
});

// initializes a game board using a 2d array filled with cell objects using nested
// loops which are set to default cell objects for now:
// it sets the bomb boolean to true if the bomb's location is found but all cells start not revealed
const generateGrid = (gridSize: number, bombLocation:
{ row: number; col: number }) => {
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
// exposeBombs and initialBombLocation is for testing purposes
// initialGridSize is to set the grid size from props (used in difficulty settings)
const App = ({
               exposeBombs = false,
               initialBombLocation,
               initialGridSize,
             }: {
  exposeBombs?: boolean;
  initialBombLocation?: { row: number; col: number };
  initialGridSize?: number;
}) => {

  // each of these manage a part of the game state
  // current grid size
  const [gridSize, setGridSize] = useState(initialGridSize ?? defaultGridSize);
  // the cell that contains the bomb
  const [bombLocation, setBombLocation] = useState(
      initialBombLocation ?? generateBombLocation(initialGridSize ?? defaultGridSize));
  // 2d array of cells for the grid
  const [grid, setGrid] = useState(() => generateGrid(gridSize, bombLocation));
  // true whether the player has lost or won
  const [gameOver, setGameOver] = useState(false);
  // true if the player wins
  const [gameWin, setGameWin] = useState(false);
  // number of seconds left before the game resets
  const [countdown, setCountdown] = useState<number | null>(null);
  // triggers reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // scoreboard logic to keep track of wins and losses
  const [wins, setWins] = useState<number | 0>(0);
  const [losses, setLosses] = useState<number | 0>(0);

  // reveal cell logic
  const revealCell = (row: number, col: number) => {
    // makes sure the game isn't already over or the cell isn't available
    // creates a copy of the grid because react state is immutable so we never directly modify the
    // grid and then set the specific cell revealed to true
    if (gameOver || grid[row][col].isRevealed) return;
    const newGrid = [...grid];
    newGrid[row][col].isRevealed = true;

    // checks if the revealed cell is a bomb and then sets the game to over, increments the
    // loss count, and then starts the countdown for the auto reset
    if (newGrid[row][col].isBomb) {
      setGameOver(true);
      setLosses((prev) => prev + 1);
      setCountdown(5);
      return;
    }

    // check to see if all the non-bomb cells are revealed
    let allSafeRevealed = true;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j].isRevealed && !newGrid[i][j].isBomb) {
          allSafeRevealed = false;
        }
      }
    }

    // if all the safe cells are revealed, then the game has been won and is set to over and
    // the win count is incremented and the countdown for auto reset starts
    if (allSafeRevealed) {
      setGameWin(true);
      setGameOver(true);
      setWins((prev) => prev + 1);
      setCountdown(5);
    }

    setGrid(newGrid);
  };

  // this resets everything for a new game
  // new random bomb location, re-generates the grid, and resets all the flags
  // uses callback to prevent the function from being re-created unless the gridsize changes
  const resetGame = useCallback(() => {
    const newBombLocation = generateBombLocation(gridSize);
    setBombLocation(newBombLocation);
    setGrid(generateGrid(gridSize, newBombLocation));
    setGameOver(false);
    setGameWin(false);
    setCountdown(null);
    setShowResetConfirm(false);
  }, [gridSize]);

  // logic for auto-reset countdown where time starts from 5 and each tick decrements
  // the countdown by 1 second and once it hits 0, reset game is called
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      resetGame();
    }
  }, [countdown, resetGame]);

  // function to provide game rules for the player on the left side of the screen
  const renderSidebarRules = () => (
      <div className="Sidebar rules">
        <h2>Game Rules</h2>
        <ul>
          <li>Click on a tile to reveal it</li>
          <li>Avoid the 💣</li>
          <li>Reveal all the safe cells to win</li>
          <li>You can change the game difficulty mode</li>
        </ul>
      </div>
  );

  // function to display the popup content with the reset confirmation prompt and game over
  // message with the countdown
  // controlled using the gameOver and showResetConfirmation states
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

  // function to display the scoreboard with the current win/loss count
  const renderSidebarScoreboard = () => (
      <div className="Sidebar scoreboard">
        <h2>Scoreboard</h2>
        <p>🎉 Wins: {wins}</p>
        <p>💥 Losses: {losses}</p>
      </div>
  );

  // function to create main minesweeper grid
  // sets up css grid layout and map each cell to generate its div
  // each cell has a unique key, css class to change the appearance based on its state, triggers
  // reveal cell when clicked, displays the bomb if it's the bomb and is revealed, and has a
  // data-testid to help with unit testing
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
                    className={`cell ${cell.isRevealed ? (cell.isBomb ? 
                        "bomb revealed" : "revealed") : ""}`}
                    onClick={() => revealCell(i, j)}
                >
                  {cell.isRevealed ? (cell.isBomb ? "💣" : "") : ""}
                </div>
            ))
        )}
      </div>
  );

  // function to render difficulty controls
  // when a user selects a difficulty level, it updates the grid size, generates a new bomb
  // location, and reset the game and all its states
  const renderDifficultyControl = () => (
      <div className="difficulty-button">
        <select
            defaultValue="5"
            data-testid="difficulty-select"
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
          <option value={3} data-testid="easy-option">🎯 Difficulty Level: Easy (3 x 3)</option>
          <option value={5} data-testid="medium-option">🎯 Difficulty Level: Medium (5 x 5)</option>
          <option value={7} data-testid="hard-option">🎯 Difficulty Level: Hard (7 x 7)</option>
        </select>
      </div>
  );

  // triggers confirmation dialog for when the reset game button is clicked
  const renderResetButton = () => (
      <div className="reset-button">
        <button onClick={() => setShowResetConfirm(true)}>🔄 Reset Game</button>
      </div>
  );

  // main block that renders the full app layout
  // left: rules
  // center: title, grid, controls, popup
  // right: scoreboard
  return (
      <div className="AppContainer">
        {renderSidebarRules()}
        <div className="App">
          <h1>Mini Minesweeper</h1>
          {renderPopup()}
          <div className="game-wrapper">
            {renderDifficultyControl()}
            {renderGrid()}
            {renderResetButton()}
          </div>
        </div>
        {renderSidebarScoreboard()}
      </div>

  );
};

export default App;

