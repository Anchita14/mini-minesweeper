import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import '@testing-library/jest-dom';

describe("Mini Minesweeper Tests", () => {

  // test to make sure that the bomb placement is random in each game --
  // a set it used to store unique bomb positions, found through a custom test id, across 5
  // renders and if at least 2 unique positions are found, the randomness is working
  test("Test Randomness of Bomb Placement", () => {
    const bombPositions = new Set();
    for (let i = 0; i < 5; i++) {
      const { container, unmount } = render(<App exposeBombs={true} />);
      const bomb = container.querySelector('[data-bomb-testid="bomb"]');
      const bombPosition = bomb?.getAttribute("data-testid");
      if (bombPosition) {
        bombPositions.add(bombPosition);
      }
      unmount();
    }
    expect(bombPositions.size).toBeGreaterThan(1);
  });

  // test checks for all the components of the default UI state to be available --
  // checks whether certain headings, titles, texts, and buttons are present and checks for the
  // default grid size of 5 x 5 and whether all the cells are not revealed
  test("Test Default Game State on Initial Load", () => {
    render(<App />);
    expect(screen.getByText("Mini Minesweeper")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Game Rules" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scoreboard" })).toBeInTheDocument();

    expect(screen.getByText(/🎉 Wins: 0/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses: 0/)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /🔄 Reset Game/i })).toBeInTheDocument();
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        expect(screen.getByTestId(`${row}-${col}`)).toBeInTheDocument();
      }
    }
    const allCells = screen.getAllByTestId(/^\d-\d$/);
    allCells.forEach(cell => {
      expect(cell.classList.contains("revealed")).toBe(false);
    });
  });

  // tests if a cell is marked as revealed once a player clicks it --
  // sets the initial grid and bomb and clicks on 0,0 and checks if it has been marked as revealed
  test("Test if Once a User Clicks a Cell it is Revealed", () => {
    render(
        <App
            initialBombLocation={{ row: 2, col: 2 }}
            initialGridSize={3}
        />
    );
    const cell = screen.getByTestId("0-0");
    fireEvent.click(cell);
    expect(cell).toHaveClass("revealed");
  });

  // tests if the user actually wins the game --
  // sets the initial state and then loops through clicking all the cells, skipping the bomb, and
  // checks for the win message
  test("Test if the User Won the Game", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
            exposeBombs={true}
        />
    );
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 0 && j === 0) continue;
        const cell = screen.getByTestId(`${i}-${j}`);
        fireEvent.click(cell);
      }
    }
    await waitFor(() => {
      expect(screen.getByText("🎉 You Win!")).toBeInTheDocument();
    });
  });

  // tests if the user actually loses the game --
  // similar to previous test, sets the initial state but simply clicks the bomb cell and checks
  // if there is a lost message
  test("Test if the User Lost the Game", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
            exposeBombs={true}
        />
    );
    const bombCell = screen.getByTestId("0-0");
    fireEvent.click(bombCell);
    await waitFor(() => {
      expect(screen.getByText("💥 Game Over!")).toBeInTheDocument();
    });
  });

  // test to check if the reset button is being rendered in the initial load
  test("Test if the Reset Button is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 1, col: 1 }} initialGridSize={3} />);
    const resetButton = screen.getByRole("button", { name: "🔄 Reset Game" });
    expect(resetButton).toBeInTheDocument();
  });

  // test to check if the popup appears after clicking the reset button --
  // clicks the reset button and then makes sure the popup content appears
  test("Test if a Popup Appears After Clicking Reset", () => {
    render(<App />);
    const resetButton = screen.getByRole("button", { name: /🔄 Reset Game/i });
    fireEvent.click(resetButton);
    expect(screen.getByText("🔄 Reset Game?")).toBeInTheDocument();
  });

  // test if the game is actually being reset when the reset button is clicked --
  // renders the game with an initial state, simulates a click move to set a cell as revealed,
  // triggers a reset, and checks if the reset works by checking if the previously clicked cell is
  // now not revealed
  test("Test if the Game is Being Reset When the Reset Button is Clicked", () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );
    const cell = screen.getByTestId("0-1");
    fireEvent.click(cell);
    expect(cell.classList.contains("revealed")).toBe(true);
    const resetButton = screen.getByRole("button", { name: "🔄 Reset Game" });
    fireEvent.click(resetButton);
    const confirmButton = screen.getByRole("button", { name: "Yes" });
    fireEvent.click(confirmButton);
    const newCell = screen.getByTestId("0-1");
    expect(newCell.classList.contains("revealed")).toBe(false);
  });

  // test everything for a full win scenario --
  // renders an initial grid, checks if certain UI components are present, simulates a full win
  // after clicking every cell but the bomb, makes sure the win message is present, and checks if
  // the scoreboard was properly updated after the win
  test("Test for a Full Win Scenario", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );
    expect(screen.getByText("Mini Minesweeper")).toBeInTheDocument();
    expect(screen.getByText("Game Rules")).toBeInTheDocument();
    expect(screen.getByText("Scoreboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset game/i })).toBeInTheDocument();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 0 && col === 0) continue;
        const cell = screen.getByTestId(`${row}-${col}`);
        fireEvent.click(cell);
      }
    }
    expect(await screen.findByText("🎉 You Win!")).toBeInTheDocument();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 0 && col === 0) continue;
        const cell = screen.getByTestId(`${row}-${col}`);
        expect(cell.classList.contains("revealed")).toBe(true);
      }
    }
    expect(screen.getByText(/🎉 Wins: 1/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses: 0/)).toBeInTheDocument();
  });

  // test everything for a full loss scenario --
  // renders an initial grid, checks if certain UI components are present, simulates a full loss
  // after clicking the bomb, makes sure the loss message is present, and checks if the scoreboard
  // was properly updated after the loss
  test("Test for a Full Lose Scenario", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );
    expect(screen.getByText("Mini Minesweeper")).toBeInTheDocument();
    expect(screen.getByText("Game Rules")).toBeInTheDocument();
    expect(screen.getByText("Scoreboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset game/i })).toBeInTheDocument();
    const bombCell = screen.getByTestId("0-0");
    fireEvent.click(bombCell);
    expect(await screen.findByText("💥 Game Over!")).toBeInTheDocument();
    expect(bombCell.classList.contains("revealed")).toBe(true);
    expect(screen.getByText(/🎉 Wins: 0/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses: 1/)).toBeInTheDocument();
  });

  // test if the game rules section is rendered on the initial load --
  // makes sure all the specific UI elements are present including the header and the list items
  test("Test if Game Rules is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 0, col: 0 }} initialGridSize={3} />);
    const rulesHeading = screen.getByRole("heading", { name: "Game Rules" });
    expect(rulesHeading).toBeInTheDocument();
    expect(screen.getByText("Click on a tile to reveal it")).toBeInTheDocument();
    expect(screen.getByText("Avoid the 💣")).toBeInTheDocument();
    expect(screen.getByText("Reveal all the safe cells to win")).toBeInTheDocument();
  });

  // test if the scoreboard section is rendered on the initial load --
  // makes sure all the specific UI elements are present including the header and win/loss labels
  test("Test if Scoreboard is Being Rendered", () => {
    render(<App initialBombLocation={{ row: 0, col: 0 }} initialGridSize={3} />);
    const scoreboardHeading = screen.getByRole("heading", { name: "Scoreboard" });
    expect(scoreboardHeading).toBeInTheDocument();
    expect(screen.getByText(/🎉 Wins:/)).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses:/)).toBeInTheDocument();
  });

  // tests if the scoreboard updates correctly after a game --
  // renders an initial game, clicks on the bomb to lose the game, checks for the game loss
  // message, and checks if the loss is updates on the scoreboard
  test("Test if Scoreboard Updates After a Game", async () => {
    render(
        <App
            initialBombLocation={{ row: 0, col: 0 }}
            initialGridSize={3}
        />
    );
    const bombCell = screen.getByTestId("0-0");
    fireEvent.click(bombCell);
    expect(await screen.findByText("💥 Game Over!")).toBeInTheDocument();
    expect(screen.getByText(/💥 Losses: 1/)).toBeInTheDocument();
  });

  // tests if the difficulty dropdown actually sets the grid to the correct size --
  // simulates each of the different grid sizes and checks for whether a certain cell coordinate
  // should or should not be present based on the grid based on the size
  test("Test Difficulty Options Set Correct Grid Size", () => {
    render(<App />);
    const select = screen.getByTestId("difficulty-select");
    // select easy (3x3)
    fireEvent.change(select, { target: { value: "3" } });
    expect(screen.getByTestId("2-2")).toBeInTheDocument();
    expect(screen.queryByTestId("4-4")).not.toBeInTheDocument();
    expect(screen.queryByTestId("6-6")).not.toBeInTheDocument();
    // select medium (5x5)
    fireEvent.change(select, { target: { value: "5" } });
    expect(screen.getByTestId("4-4")).toBeInTheDocument();
    expect(screen.queryByTestId("6-6")).not.toBeInTheDocument();
    expect(screen.queryByTestId("2-2")).toBeInTheDocument(); // still valid
    // select hard (7x7)
    fireEvent.change(select, { target: { value: "7" } });
    expect(screen.getByTestId("6-6")).toBeInTheDocument();
    expect(screen.getByTestId("4-4")).toBeInTheDocument();
    expect(screen.getByTestId("2-2")).toBeInTheDocument();
  });

});
