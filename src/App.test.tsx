import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import '@testing-library/jest-dom';

describe("Mini Minesweeper Tests", () => {

  test("Test Randomness of Bomb Placement", () => {
    const bombPositions = new Set();
    for (let i = 0; i < 5; i++) {
      const { container, unmount } = render(<App exposeBombs={true} />);
      // Find the bomb cell using the custom bomb data attribute
      const bomb = container.querySelector('[data-bomb-testid="bomb"]');
      // Get the bomb's position using the cell's coordinates from data-testid
      const bombPosition = bomb?.getAttribute("data-testid");
      if (bombPosition) {
        bombPositions.add(bombPosition);
      }
      unmount(); // Clean up between renders
    }
    expect(bombPositions.size).toBeGreaterThan(1);
  });

  test("Test Default Game State on Initial Load", () => {
    render(<App />);

    // Title should be present
    expect(screen.getByText("Mini Minesweeper")).toBeInTheDocument();

    // Game Rules and Scoreboard sections
    expect(screen.getByRole("heading", { name: "Game Rules" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scoreboard" })).toBeInTheDocument();

    // Scoreboard starts at 0
    expect(screen.getByText(/🎉 Wins: 0/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses: 0/)).toBeInTheDocument();

    // Reset button is present
    expect(screen.getByRole("button", { name: /🔄 Reset Game/i })).toBeInTheDocument();

    // Grid is rendered (default 5x5 = 25 cells)
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        expect(screen.getByTestId(`${row}-${col}`)).toBeInTheDocument();
      }
    }

    // No revealed cells initially
    const allCells = screen.getAllByTestId(/^\d-\d$/);
    allCells.forEach(cell => {
      expect(cell.classList.contains("revealed")).toBe(false);
    });
  });

  test("Test if Once a User Clicks a Cell it is Revealed", () => {
    render(
        <App
            initialBombLocation={{ row: 2, col: 2 }}
            initialGridSize={3}
        />
    );
    const cell = screen.getByTestId("0-0");
    fireEvent.click(cell);
    // After click, it should have the "revealed" class
    expect(cell).toHaveClass("revealed");
  });

  test("Test if the User Won the Game", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
            exposeBombs={true}
        />
    );
    // Loop through all cells in a 3x3 grid, skip the bomb at (0, 0)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 0 && j === 0) continue; // skip the bomb
        const cell = screen.getByTestId(`${i}-${j}`);
        fireEvent.click(cell);
      }
    }
    // Expect a win message to appear
    await waitFor(() => {
      expect(screen.getByText("🎉 You Win!")).toBeInTheDocument();
    });
  });

  test("Test if the User Lost the Game", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
            exposeBombs={true}
        />
    );
    // find the cell at (0, 0) which is the bomb
    const bombCell = screen.getByTestId("0-0");
    // click the bomb
    fireEvent.click(bombCell);
    // assert that the "Game Over" popup is shown
    await waitFor(() => {
      expect(screen.getByText("💥 Game Over!")).toBeInTheDocument();
    });
  });

  test("Test if the Reset Button is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 1, col: 1 }} initialGridSize={3} />);
    const resetButton = screen.getByRole("button", { name: "🔄 Reset Game" });
    expect(resetButton).toBeInTheDocument();
  });

  test("Test if a Popup Appears After Clicking Reset", () => {
    render(<App />);
    // Click the Reset button
    const resetButton = screen.getByRole("button", { name: /🔄 Reset Game/i });
    fireEvent.click(resetButton);
    // Check for the popup confirmation text
    expect(screen.getByText("🔄 Reset Game?")).toBeInTheDocument();
  });

  test("Test if the Game is Being Reset When the Reset Button is Clicked", () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );

    // Click on a safe cell first (optional, just to interact with game)
    const cell = screen.getByTestId("0-1");
    fireEvent.click(cell);
    expect(cell.classList.contains("revealed")).toBe(true);

    // Click the reset button
    const resetButton = screen.getByRole("button", { name: "🔄 Reset Game" });
    fireEvent.click(resetButton);

    // Confirm reset in popup
    const confirmButton = screen.getByRole("button", { name: "Yes" });
    fireEvent.click(confirmButton);

    // After reset, the cell should no longer be revealed
    const newCell = screen.getByTestId("0-1");
    expect(newCell.classList.contains("revealed")).toBe(false);
  });

  test("Test for a Full Win Scenario", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );
    // 1. Core UI check
    expect(screen.getByText("Mini Minesweeper")).toBeInTheDocument();
    expect(screen.getByText("Game Rules")).toBeInTheDocument();
    expect(screen.getByText("Scoreboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset game/i })).toBeInTheDocument();
    // 2. Click all safe cells (avoid bomb at 0,0)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 0 && col === 0) continue;
        const cell = screen.getByTestId(`${row}-${col}`);
        fireEvent.click(cell);
      }
    }
    // 3. Check win message and revealed cells
    expect(await screen.findByText("🎉 You Win!")).toBeInTheDocument();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 0 && col === 0) continue;
        const cell = screen.getByTestId(`${row}-${col}`);
        expect(cell.classList.contains("revealed")).toBe(true);
      }
    }
    // 4. Scoreboard shows win
    expect(screen.getByText(/🎉 Wins: 1/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses: 0/)).toBeInTheDocument();
  });

  test("Test for a Full Lose Scenario", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );
    // 1. Core UI check
    expect(screen.getByText("Mini Minesweeper")).toBeInTheDocument();
    expect(screen.getByText("Game Rules")).toBeInTheDocument();
    expect(screen.getByText("Scoreboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset game/i })).toBeInTheDocument();
    // 2. Click the bomb (lose the game)
    const bombCell = screen.getByTestId("0-0");
    fireEvent.click(bombCell);
    // 3. Check for game over message
    expect(await screen.findByText("💥 Game Over!")).toBeInTheDocument();
    // 4. Check that the bomb cell is revealed
    expect(bombCell.classList.contains("revealed")).toBe(true);
    // 5. Scoreboard shows loss
    expect(screen.getByText(/🎉 Wins: 0/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses: 1/)).toBeInTheDocument();
  });

  test("Test if Game Rules is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 0, col: 0 }} initialGridSize={3} />);
    // Look for the Game Rules heading
    const rulesHeading = screen.getByRole("heading", { name: "Game Rules" });
    expect(rulesHeading).toBeInTheDocument();
    // Optionally check for specific rule list items
    expect(screen.getByText("Click on a tile to reveal it")).toBeInTheDocument();
    expect(screen.getByText("Avoid the 💣")).toBeInTheDocument();
    expect(screen.getByText("Reveal all the safe cells to win")).toBeInTheDocument();
  });

  test("Test if Scoreboard is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 0, col: 0 }} initialGridSize={3} />);
    // Check for the Scoreboard heading
    const scoreboardHeading = screen.getByRole("heading", { name: "Scoreboard" });
    expect(scoreboardHeading).toBeInTheDocument();
    // Check for win/loss labels
    expect(screen.getByText(/🎉 Wins:/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses:/)).toBeInTheDocument();
  });

  test("Test if Scoreboard Updates After a Game", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );
    // Click on the bomb to lose the game
    const bombCell = screen.getByTestId("0-0");
    fireEvent.click(bombCell);

    // Wait for the loss message
    await waitFor(() => {
      expect(screen.getByText("💥 Game Over!")).toBeInTheDocument();
    });

    // Wait for auto-reset after countdown
    await waitFor(() => {
      expect(screen.getByText(/💥 Losses: 1/)).toBeInTheDocument();
    }, { timeout: 6000 }); // Account for the 5-second countdown
  });

  test("Test Difficulty Options Set Correct Grid Size", () => {
    render(<App />);

    const select = screen.getByTestId("difficulty-select");

    // Select Easy (3x3): only 2-2 should exist
    fireEvent.change(select, { target: { value: "3" } });
    expect(screen.getByTestId("2-2")).toBeInTheDocument();
    expect(screen.queryByTestId("4-4")).not.toBeInTheDocument();
    expect(screen.queryByTestId("6-6")).not.toBeInTheDocument();

    // Select Medium (5x5): 4-4 should exist, 6-6 shouldn't
    fireEvent.change(select, { target: { value: "5" } });
    expect(screen.getByTestId("4-4")).toBeInTheDocument();
    expect(screen.queryByTestId("6-6")).not.toBeInTheDocument();
    expect(screen.queryByTestId("2-2")).toBeInTheDocument(); // still valid

    // Select Hard (7x7): 6-6 should exist
    fireEvent.change(select, { target: { value: "7" } });
    expect(screen.getByTestId("6-6")).toBeInTheDocument();
    expect(screen.getByTestId("4-4")).toBeInTheDocument();
    expect(screen.getByTestId("2-2")).toBeInTheDocument();
  });

});
