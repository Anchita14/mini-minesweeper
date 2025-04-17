import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import '@testing-library/jest-dom';

describe("Mini Minesweeper Tests", () => {

  test("1. Test Randomness of Bomb Placement", () => {
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

  test("2: Test if the User Won the Game", async () => {
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

  test("3: Test if the User Lost the Game", async () => {
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

  test("4: Test if Once a User Clicks a Cell it is Revealed", () => {
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

  test("5: Integration Test for a Full Win Scenario", async () => {
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

  test("6: Integration Test for a Full Lose Scenario", async () => {
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

  test("7: Test if the Reset Button is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 1, col: 1 }} initialGridSize={3} />);
    const resetButton = screen.getByRole("button", { name: "🔄 Reset Game" });
    expect(resetButton).toBeInTheDocument();
  });

  test("8: Test if the Game Resets When it's Over", async () => {
    jest.setTimeout(10000); // give time for countdown + reset
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
            exposeBombs={true}
        />
    );
    // Step 1: Click the bomb (0, 0)
    const bombCell = await screen.findByTestId("0-0");
    fireEvent.click(bombCell);

    // Step 2: Wait for "Game Over" to appear
    expect(await screen.findByText("💥 Game Over!")).toBeInTheDocument();

    // Step 3: Wait for "Game Over" to disappear (reset after 5 seconds)
    await waitFor(
        () => {
          // Check that the message is gone
          expect(screen.queryByText("💥 Game Over!")).not.toBeInTheDocument();

          // Check that a cell is reset (not revealed anymore)
          const cellAfterReset = screen.getByTestId("0-0");
          expect(cellAfterReset.classList.contains("revealed")).toBe(false);
        },
        { timeout: 6000 }
    );
  });

  test("9: Test if the Game is Being Reset When the Reset Button is Clicked", () => {
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

  test("10: Test if Game Rules is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 0, col: 0 }} initialGridSize={3} />);
    // Look for the Game Rules heading
    const rulesHeading = screen.getByRole("heading", { name: "Game Rules" });
    expect(rulesHeading).toBeInTheDocument();
    // Optionally check for specific rule list items
    expect(screen.getByText("Click on a tile to reveal it")).toBeInTheDocument();
    expect(screen.getByText("Avoid the 💣")).toBeInTheDocument();
    expect(screen.getByText("Reveal all the safe cells to win")).toBeInTheDocument();
  });

  test("11: Test if Scoreboard is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 0, col: 0 }} initialGridSize={3} />);
    // Check for the Scoreboard heading
    const scoreboardHeading = screen.getByRole("heading", { name: "Scoreboard" });
    expect(scoreboardHeading).toBeInTheDocument();
    // Check for win/loss labels
    expect(screen.getByText(/🎉 Wins:/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses:/)).toBeInTheDocument();
  });

  test("12: Test if Scoreboard Updates After a Game", async () => {
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

  test("13: Test if a Popup Appears After Clicking Reset", () => {
    render(<App />);
    // Click the Reset button
    const resetButton = screen.getByRole("button", { name: /🔄 Reset Game/i });
    fireEvent.click(resetButton);
    // Check for the popup confirmation text
    expect(screen.getByText("🔄 Reset Game?")).toBeInTheDocument();
  });

});
