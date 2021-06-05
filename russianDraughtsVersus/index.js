/**
 * A representation of the state of the game at any particular point in time
 */
class State {
  /**
   * Creates a new `State` object, either a completely new one or using the given properties
   *
   * ---
   * @param {Array<String?>?} array An array of the pieces present on the board
   * @param {String?} turn The one who is supposed to make a move at a particular stage of the game, either white, indicated by "wW", or  black, indicated by "bB"
   * @param {String?} winner The one who has won a game, either white, indicated by "wW", or  black, indicated by "bB"
   * @param {{count: Number, turn: String}?} drawCount An object that indicates how far the game has counted since one of the sides remained with only one piece, a king
   *
   * ---
   * @returns {State} a new `State` object
   */
  constructor(array, turn, winner, drawCount) {
    // prettier-ignore
    this.array = array || [
      undefined, "b", undefined, "b", undefined, "b", undefined, "b",
      "b", undefined, "b", undefined, "b", undefined, "b", undefined, 
      undefined, "b", undefined, "b", undefined, "b", undefined, "b",
      " ", undefined, " ", undefined, " ", undefined, " ", undefined,
      undefined, " ", undefined, " ", undefined, " ", undefined, " ",
      "w", undefined, "w", undefined, "w", undefined, "w", undefined,
      undefined, "w", undefined, "w", undefined, "w", undefined, "w",
      "w", undefined, "w", undefined, "w", undefined, "w", undefined,
    ];
    this.turn = turn || "wW";
    this.winner = winner;
    this.drawCount = drawCount;
  }
  /**
   * Creates a new state based on a given `State` object
   * @param {State} state A `State` object to create a new one from
   * @returns {State} A new `State` object
   */
  static from(state) {
    return new State(
      [...state.array],
      state.turn,
      state.winner,
      state.drawCount
        ? {
            count: state.drawCount.count,
            turn: state.drawCount.turn,
          }
        : undefined
    );
  }
}

let topBar = document.querySelector("#topBar"),
  table = document.querySelector("table"),
  bgModeButton = document.querySelector("#bgMode"),
  undoButton = document.getElementById("undoButton"),
  restartButton = document.getElementById("restartButton"),
  bgModeButtonState = localStorage.getItem("bgMode") || "off",
  DOMCells = [], // An array of the DOM Elements of the cells displayed in the table element
  gameHistory = [],
  moveProgress = [],
  highlighted = [],
  capturingMove = false,
  state = localStorage.getItem("gameState")
    ? State.from(JSON.parse(localStorage.getItem("gameState")))
    : new State(),
  lastState = State.from(state);

/**
 * The main starting point of the program
 */
function main() {
  document.querySelector(".errorMsg").remove();
  document.body.style.display = "flex";
  topBar.style.display = "block";

  bgModeButtonState == "off" ? lightMode() : darkMode();

  // Setting up the DOM elements of the table where all the boxes of the game will be displayed
  for (let i = 0; i < 8; i++) {
    let row = document.createElement("tr");
    table.append(row);
    for (let j = 0; j < 8; j++) {
      let box = document.createElement("td");
      if ((i + j) % 2 == 1) {
        box.className = "dark";
        box.id = String(j) + "," + String(i);
        box.onclick = () => {
          cellClick(box.id);
        };
      } else {
        box.className = "light";
      }
      row.append(box);
      DOMCells[i * 8 + j] = box;
    }
  }

  refresh();
}

/**
 * Changes the display of the page to a dark theme
 */
function darkMode() {
  document.body.style.backgroundColor = "#272822";
  topBar.className = "darkMode";
  bgModeButtonState = "on";
  localStorage.setItem("bgMode", "on");
}

/**
 * Changes the display of the page to a light theme
 */
function lightMode() {
  document.body.style.backgroundColor = "#e7d9cf";
  topBar.className = "lightMode";
  bgModeButtonState = "off";
  localStorage.setItem("bgMode", "off");
}

/**
 * Switches the background mode between dark and light themes depending on its current state
 */
function bgMode() {
  if (bgModeButtonState == "off") {
    darkMode();
  } else if (bgModeButtonState == "on") {
    lightMode();
  }
}

/**
 * Perfoms an action when a cell is clicked by the user
 *
 * ---
 * @param {String} id The position of the clicked cell, relative to the whole grid of cells
 */
function cellClick(id) {
  // If a winner has already been found, don't even bother responding
  if (state.winner) return;

  // Converts the given `id` to an index that can be used on the arrays of cells
  let index = Number(id[0]) + Number(id[2]) * 8;

  // If the user has not already started making a move
  if (moveProgress.length == 0) {
    if (state.turn.indexOf(state.array[index]) == -1) return;
    let dests = validDestinations(index, true);
    highlight(dests);
    if (dests.length > 0)
      moveProgress.push({ pos: index, direction: undefined });
  }
  // If a user has started making a move, like a multiple-capture move
  else {
    let i = -1;
    // If the user has clicked on a highlighted cell
    if (
      highlighted.some((value) => {
        i++;
        return value.pos == index;
      })
    ) {
      chosenMove = highlighted[i];
      move(chosenMove);
      dehighlight();
      refresh();
      moveProgress.push(chosenMove);
      let dests = validDestinations(index);

      // If the player has chosen to make a capturing move while they
      // had only remained with a king and their moves were being counted
      if (
        chosenMove.capturing &&
        state.drawCount &&
        state.turn == state.drawCount.turn
      ) {
        state.drawCount.count = 1;
      }

      // If the player can capture another piece, highlight possible destinations...
      if (chosenMove.capturing && dests.length > 0) {
        highlight(dests);
      }
      // ...otherwise, just finish the move so that the next player can play
      else {
        highlighted = [];
        moveProgress = [];
        state.turn = state.turn == "wW" ? "bB" : "wW";
        capturingMove = false;
        updateHistory();
        evaluate();
      }
    } else {
      dehighlight();
      moveProgress = [];
      cellClick(id);
    }
  }
}

/**
 * Returns an array of all the possible moves that can be made from a certain piece
 *
 * ---
 * @param {Number} index The index, or location of the cell that is being tested
 * @param {Boolean} firstMove Indicates whether the current move is the first or a latter part of a multiple-capture move
 *
 * ---
 * @returns {Array<{ pos: Number, capturing: Number?, direction: Number}>} An array of possible destinations
 */
function validDestinations(index, firstMove = false) {
  let places = [];
  let piece = state.array[index];
  let others = "wW".indexOf(piece) != -1 ? "bB" : "wW";

  // If the piece at the given index is not a king
  if ("wb".indexOf(piece) != -1) {
    // highlights either of the two forward diagonal cells if it is free to move onto
    if (firstMove && !capturingMove) {
      // determines the index of the cell just ahead of the current cell
      let factor = piece == "w" ? -8 : 8;

      // -1 and 1, when added to factor, will give you the
      // index of either of the forward diagonal cells
      for (let i of [-1, 1]) {
        let possibleDest = i + index + factor;
        if (state.array[possibleDest] == " ")
          places.push({
            pos: possibleDest,
            capturing: undefined,
            direction: i + factor,
          });
      }
    }
    // 7, 9, -7 and -9, when added to `index` give you the indices of all four diagonal cells
    for (let i of [9, 7, -9, -7]) {
      if (
        others.indexOf(state.array[index + i]) != -1 &&
        state.array[index + 2 * i] == " "
      ) {
        if (!firstMove && moveProgress[moveProgress.length - 1].direction == -i)
          continue;
        places.push({
          pos: index + 2 * i,
          capturing: index + i,
          direction: i,
        });
      }
    }
  }
  // If the piece at the given index is a king
  else if ("WB".indexOf(piece) != -1) {
    // multiples of 7, 9, -7 and -9, when added to `index` give you the indices
    // of any cell in all four diagonal directions
    for (let direction of [9, 7, -9, -7]) {
      // Avoid going backwards in the opposite direction to that of the last step
      if (
        !firstMove &&
        moveProgress[moveProgress.length - 1].direction == -direction
      )
        continue;
      let capturedSome = false;
      for (let i = 1; i < 8; i++) {
        let place = index + i * direction;
        if (state.array[place] == " ") {
          if (capturingMove && !capturedSome) continue;
          places.push({
            pos: place,
            direction,
            capturing: capturedSome ? capturedSome : undefined,
          });
        } else if (
          others.indexOf(state.array[place]) != -1 &&
          !capturedSome &&
          state.array[index + ++i * direction] == " "
        ) {
          places.push({
            pos: index + i * direction,
            capturing: place,
            direction,
          });
          capturedSome = place;
        } else {
          break;
        }
      }
    }
    // If there is a possible destination in the current direction which would
    // allow the king to capture again, remove possible destinations which do
    // not involve capturing again
    if (places.some((element) => element.capturing)) {
      let continuing = [];
      for (let element of places) {
        for (let direction of [9, 7, -9, -7]) {
          if (element.direction == -direction) continue;
          for (let i = 1; i < 8; i++) {
            let place = element.pos + i * direction;
            if (state.array[place] == " ") {
            } else if (
              others.indexOf(state.array[place]) != -1 &&
              state.array[element.pos + ++i * direction] == " " &&
              element.capturing
            ) {
              continuing.push(element);
              break;
            } else {
              break;
            }
          }
          if (continuing.length > 0) break;
        }
      }
      if (continuing.length > 0) {
        places = places.filter((value) =>
          continuing.some((elem) => elem.pos == value.pos)
        );
      }
    }
  }
  return places;
}

/**
 * Moves a chosen piece to a location given by `chosenDestination`
 *
 * ---
 * @param {{ pos: Number, capturing: Number, direction: Number}} chosenDestination An object from the `highlighted` array that gives the destination of the chosen move
 */
function move(chosenDestination) {
  let from = moveProgress[moveProgress.length - 1];
  let to = chosenDestination.pos;

  state.array[to] = state.array[from.pos];
  state.array[from.pos] = " ";

  // if a normal piece reaches the opposite side's backline, promote it to a king
  if (
    (state.array[to] == "w" && [1, 3, 5, 7].indexOf(to) != -1) ||
    (state.array[to] == "b" && [56, 58, 60, 62].indexOf(to) != -1)
  ) {
    state.array[to] = state.array[to].toUpperCase();
  }

  // if the move is a capturing move, remove the piece being jumped
  if (chosenDestination.capturing)
    state.array[chosenDestination.capturing] = " ";
}

/**
 * Highlights cells given by the `places` array
 *
 * ---
 * @param {Array<{ pos: Number, capturing: Number, direction: Number}>} places Places to highlight
 */
function highlight(places) {
  highlighted = places;
  for (let place of highlighted) {
    DOMCells[place.pos].style.backgroundColor = "#e4630d";
  }
}

/**
 * Dehighlights places which were highlighted using the `highlight` function
 */
function dehighlight() {
  for (let place of highlighted) {
    DOMCells[place.pos].style.backgroundColor = "";
  }
  highlighted = [];
}

/**
 * Updates the HTML DOM elements to display the state of the game based on
 * the `state` object
 */
function refresh() {
  let i = 0;

  for (let cell of DOMCells) {
    if (cell != undefined) {
      switch (state.array[i]) {
        case "b":
          cell.innerHTML = `
                          <svg
         xmlns="http://www.w3.org/2000/svg"
         width="300"
         height="300"
         viewBox="0 0 79.374998 79.375002"
         version="1.1"
         id="svg863"
         >
        <g
           id="layer1"
           transform="translate(0,-217.62499)">
          <g
             id="g851"
             transform="matrix(1.1570248,0,0,1.1570248,-98.418565,143.65891)">
            <circle
               r="22.867559"
               cy="98.229164"
               cx="119.3631"
               id="path815"
               style="opacity:1;fill:#333333;fill-opacity:1;fill-rule:evenodd;
               stroke:none;stroke-width:1;stroke-linecap:square;
               stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;
               stroke-dashoffset:124.72441101;stroke-opacity:1;
               paint-order:stroke fill markers" />
          </g>
        </g>
      </svg>
      `;
          break;
        case "w":
          cell.innerHTML = `
                          <svg
         xmlns="http://www.w3.org/2000/svg"
         width="300"
         height="300"
         viewBox="0 0 79.374998 79.375002"
         version="1.1"
         id="svg863"
         >
        <g
           id="layer1"
           transform="translate(0,-217.62499)">
          <circle
             r="26.458334"
             cy="257.3125"
             cx="39.687496"
             id="circle845"
             style="opacity:1;fill:#f2f2f2;fill-opacity:1;fill-rule:evenodd;
             stroke:none;stroke-width:1.15702474;stroke-linecap:square;
             stroke-linejoin:miter;stroke-miterlimit:4;
             stroke-dasharray:none;stroke-dashoffset:124.72441101;
             stroke-opacity:1;paint-order:stroke fill markers" />
        </g>
      </svg>
      `;
          break;
        case "B":
          cell.innerHTML = `
          <svg
         xmlns="http://www.w3.org/2000/svg"
         width="300"
         height="300"
         viewBox="0 0 79.374998 79.375002"
         version="1.1"
         id="svg863"
         >
        <g
           id="layer1"
           transform="translate(0,-217.62499)">
          <g
             id="g851"
             transform="matrix(1.1570248,0,0,1.1570248,-98.418565,143.65891)">
            <circle
               r="22.867559"
               cy="98.229164"
               cx="119.3631"
               id="path815"
               style="opacity:1;fill:#333333;fill-opacity:1;fill-rule:evenodd;
               stroke:none;stroke-width:1;stroke-linecap:square;
               stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;
               stroke-dashoffset:124.72441101;stroke-opacity:1;
               paint-order:stroke fill markers" />
            <path
               id="rect817"
               d="m 105.98098,89.786977 1.16505,16.884383 h 24.43413 l 
               1.16505,-16.884383 -8.5296,8.78747 -4.85252,-8.78747
                -4.85251,8.78747 z"
               style="opacity:1;fill:#f2f2f2;fill-opacity:1;fill-rule:evenodd;
               stroke:none;stroke-width:0.73371655;stroke-linecap:square;
               stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;
               stroke-dashoffset:124.72441101;stroke-opacity:1;
               paint-order:stroke fill markers" />
          </g>
        </g>
      </svg>
      `;
          break;
        case "W":
          cell.innerHTML = `
          <svg
         xmlns="http://www.w3.org/2000/svg"
         width="300"
         height="300"
         viewBox="0 0 79.374998 79.375002"
         version="1.1"
         id="svg863"
         >
        <g
           id="layer1"
           transform="translate(0,-217.62499)">
          <g
             id="g855"
             transform="matrix(1.1570248,0,0,1.1570248,-111.97574,71.499808)">
            <circle
               style="opacity:1;fill:#f2f2f2;fill-opacity:1;fill-rule:evenodd;
               stroke:none;stroke-width:1;stroke-linecap:square;
               stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;
               stroke-dashoffset:124.72441101;stroke-opacity:1;
               paint-order:stroke fill markers"
               id="circle845"
               cx="131.08037"
               cy="160.59525"
               r="22.867559" />
            <path
               style="opacity:1;fill:#4d4d4d;fill-opacity:1;fill-rule:evenodd;
               stroke:none;stroke-width:0.73371655;stroke-linecap:square;
               stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;
               stroke-dashoffset:124.72441101;stroke-opacity:1;
               paint-order:stroke fill markers"
               d="m 117.69824,152.15305 1.16505,16.88438 h 24.43413 l 
               1.16505,-16.88438 -8.14688,8.78747 -5.23524,-8.78747 
               -5.09013,8.78747 z"
               id="path847" />
          </g>
        </g>
      </svg>
      `;
          break;
        default:
          cell.innerHTML = " ";
      }
    }
    i++;
  }
}

/**
 * Evaluates the state of the game after each move and determines whether or not
 * the game is ended, whether the next move is a capturing move, etc
 */
function evaluate() {
  let possibleMoves = [];

  // Determine the possible moves that could be played by the
  // current player in the current state
  for (let i = 0; i < 64; i++) {
    // if the piece at the current position is not of the color which is
    // supposed to be moving now or the box is empty, skip it
    if (state.turn.indexOf(state.array[i]) == -1) continue;

    let moves = validDestinations(i, true);
    if (moves.length > 0) {
      possibleMoves.push({ index: i, moves: moves });
    }
  }

  // If the current player has no possible moves, then declare their
  // opponent the winner...
  if (possibleMoves.length == 0) {
    confirmWinner(state.turn == "wW" ? "Black" : "White");
  }
  // ...otherwise, determine if their current move is a capturing one
  else {
    capturingMove = possibleMoves.some((location) => {
      return location.moves.some((destination) =>
        Boolean(destination.capturing)
      );
    });
  }

  // if the game hasn't already started counting for a draw
  // determine if the count should start...
  if (!state.drawCount) {
    let pieceCount = 0;
    let kingCount = 0;
    for (let i = 0; i < 64; i++) {
      if (state.turn.indexOf(state.array[i]) != -1) {
        pieceCount++;
        if ("WB".indexOf(state.array[i]) != -1) {
          kingCount++;
        }
      }
    }
    if (pieceCount == 1 && kingCount == 1) {
      state.drawCount = { count: 1, turn: state.turn };
    }
  }
  // ...otherwise, check if the count has reached its limit as well as increment it
  else {
    if (state.drawCount.count >= 12) confirmWinner("Draw");
    if (state.turn == state.drawCount.turn) state.drawCount.count++;
  }
}

/**
 * @param {"White" | "Black" | "Draw"} winner
 */
function confirmWinner(winner) {
  state.winner = winner;
  if (winner == "Draw") alert("Game is a draw");
  else alert(state.winner + " has won");
}

/**
 * Restarts the game
 */
function restart() {
  state = new State();
  moveProgress = [];
  capturingMove = false;
  gameHistory = [];
  dehighlight();
  refresh();
  updateHistory();
}

/**
 * Manages the `gameHistory` and `lastState` objects appropriately,
 * as well as undoing the game
 *
 * ---
 * @param {Boolean} undo `true` if the function has been called to undo a previous move and `false` otherwise
 */
function updateHistory(undo = false) {
  if (undo) {
    if (gameHistory.length > 0) state = gameHistory.pop();
    lastState = State.from(state);
    dehighlight();
    moveProgress = [];
    capturingMove = false;
    evaluate();
    refresh();
  } else {
    gameHistory.push(lastState);
    lastState = State.from(state);
  }
  localStorage.setItem("gameState", JSON.stringify(state));
}

main();
