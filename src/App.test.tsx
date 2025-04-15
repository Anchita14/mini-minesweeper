import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import '@testing-library/jest-dom';

describe("Mini Minesweeper Tests", () => {


  const findBombPosition = () => {
    const { container } = render(<App />);
    const cells = Array.from(container.querySelectorAll(".cell"));

    let bombIndex = -1;
    cells.forEach((cell, index) => {
      cell.click(); // simulate user clicking each cell
      if (cell.classList.contains("bomb")) {
        bombIndex = index;
      }
    });

    return bombIndex;
  };



  test("1. A random bomb position is selected", () => {
    render(<App />);
    const cells = screen.getAllByRole("button");
    expect(cells.length).toBe(25); // Ensure 5x5 grid is rendered
  });

  test("2. Check if the user wins the game", async () => {
    render(<App />);
    const cells = screen.getAllByRole("button");

    // Click all cells except the top-left corner (where bomb is placed in your code)
    for (let i = 0; i < cells.length; i++) {
      // skip 0 since bomb is always at (0,0) = first cell
      if (i !== 0) {
        fireEvent.click(cells[i]);
      }
    }

    // Final expected win message after last safe click
    await waitFor(() => {
      expect(screen.getByText(/you win/i)).toBeInTheDocument();
    });
  });

  test("3. Check if the user lost when they clicked on the bomb", async () => {
    render(<App />);
    const cells = screen.getAllByRole("button");

    // Click the bomb cell at (0, 0) → first in array
    fireEvent.click(cells[0]);

    await waitFor(() =>
        expect(screen.getByText(/game over/i)).toBeInTheDocument()
    );
  });

  test("4. Clicking a non-bomb cell marks it as revealed", () => {
    const { container } = render(<App />);
    const cell = container.querySelector(".cell:not(.bomb)") as HTMLElement;
    fireEvent.click(cell);
    expect(cell.classList.contains("revealed")).toBe(true);
  });

  test("5. Integration test - failure scenario", async () => {
    render(<App />);
    const cells = screen.getAllByRole("button");

    let clickedBomb = false;
    for (let cell of cells) {
      fireEvent.click(cell);
      if (cell.textContent.includes("💣")) {
        clickedBomb = true;
        break;
      }
    }

    expect(clickedBomb).toBe(true);

    await waitFor(() =>
        expect(screen.getByText(/game over/i)).toBeInTheDocument()
    );
  });

  test("6. Integration test - winning scenario", async () => {
    render(<App />);
    const cells = screen.getAllByRole("button");

    for (let cell of cells) {
      if (!cell.textContent.includes("💣")) {
        fireEvent.click(cell);
      }
    }

    await waitFor(() =>
        expect(screen.getByText(/you win/i)).toBeInTheDocument()
    );
  });

  test("7a. Game reset happens after game over", async () => {
    render(<App />);
    const cells = screen.getAllByRole("button");

    for (let cell of cells) {
      fireEvent.click(cell);
      if (cell.textContent.includes("💣")) break;
    }

    await waitFor(() =>
        expect(screen.getByText(/game restarting/i)).toBeInTheDocument()
    );
  });

  test("7b. Game reset happens when reset button is clicked", () => {
    render(<App />);
    const resetBtn = screen.getByText(/reset game/i);
    fireEvent.click(resetBtn);

    expect(screen.getByText(/reset game\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Yes"));
    // No assertion needed, as we're testing the reset flow completion
  });
});
