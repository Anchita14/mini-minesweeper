import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import '@testing-library/jest-dom';

describe("Mini Minesweeper Tests", () => {

  test("1. Test Randomness of Bomb Placement", () => {
    // to track unique bomb positions
    const bombPositions = new Set();
    // render the game 5 times
    for (let i = 0; i < 5; i++) {
      //renders app using bombExposed as true
      render(<App exposeBombs={true} />);
      //find bombs on board
      const bombs = screen.getAllByTestId("bomb");
      //get bomb positions
      const positions = bombs.map(bomb => bomb.getAttribute("data-cell-id")).join("-");
      // store unique bomb positions in a set
      bombPositions.add(positions);
    }
    // if bomb positions are random, the set should contain more than one unique position so this
    // ensures the bomb positions are different
    expect(bombPositions.size).toBeGreaterThan(1);
  });


});
