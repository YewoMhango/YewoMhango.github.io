/**
 * Game state at any point in time
 */
class State {
  /**
   * Creates new `State` object
   */
  constructor() {
    this.won = false;
    this.turn = 0;
    this.array = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
  }
}

DOMBoxes = [];

for (let i = 0; i < 9; i++) {
  let box = document.getElementById(String(i));
  DOMBoxes[i] = box;
  box.style.backgroundColor = "";
}

console.log(DOMBoxes);
let state = new State();

forAllDOMBoxes((box) => {
  box.onclick = () => {
    move(box.id);
  };
});

/**
 * Recognizes a user as having clicked on a button with a given `id`
 *
 * ---
 * @param {String} id The id of the box that was clicked
 */
function move(id) {
  if (state.turn >= 9) return;
  if (state.won) return;

  console.log(id);
  let index = Number(id);

  if (state.array[index] != " ") return;

  if (state.turn % 2 == 0) {
    state.array[index] = "x";
  } else {
    state.array[index] = "o";
  }

  let { winner, matches } = processMove();

  state.turn++;
  refresh();

  if (winner != undefined) {
    state.won == true;
    showWinner(matches);
  } else if (state.turn == 9) {
    terminate();
  }
}

/**
 * @param {Array<Number>} matches boxes to be highlighted to show the winning line
 */
function showWinner(matches = []) {
  forAllDOMBoxes((box, i) => {
    if (matches.indexOf(i) == -1) return;
    box.style.backgroundColor = "#da7e38";
  });

  terminate();
}

/**
 * Ends and resets the game
 */
function terminate() {
  setTimeout(() => {
    state = new State();

    forAllDOMBoxes((box) => {
      box.style.backgroundColor = "#534b45";
    });

    refresh();
  }, 1000);
}

/**
 * Updates the DOM to match the current state of the game
 */
function refresh() {
  forAllDOMBoxes((box, i) => {
    if (state.array[i] == "x") {
      console.log("putting x");
      box.innerHTML = `
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="300"
            height="300"
            viewBox="0 0 79.374998 79.375002"
            version="1.1"
            id="svg8"
          >
            <g
              inkscape:label="Layer 1"
              inkscape:groupmode="layer"
              id="layer1"
              transform="translate(0,-217.62498)"
            >
              <path
                style="opacity:1;fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:none;
                stroke-width:0.47560433;stroke-linecap:square;stroke-linejoin:miter;
                stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:124.72441101;
                stroke-opacity:1;paint-order:stroke fill markers"
                d="m 20.425591,238.48491 c -0.815612,0.99134 -0.886251,2.45461 0.02231,3.36317 l 
                15.466489,15.4663 -15.421022,15.42084 c -1.023106,1.02309 -0.819417,2.67934 
                0.167816,3.66223 1.141655,1.13664 2.803463,0.91688 3.901463,-0.18111 l 
                15.126822,-15.12664 15.426678,15.42649 c 1.021295,1.02133 2.669692,0.81239 
                3.657394,-0.17301 0.991,-0.98869 1.097421,-2.62199 0.136391,-3.58314 L 
                43.464623,257.31487 58.885645,241.89404 c 0.949784,-0.94978 0.835936,-2.46452 
                0.01466,-3.46635 -0.95485,-1.16477 -2.736668,-1.36259 -3.768744,-0.33022 l 
                -15.44194,15.44207 -15.472875,-15.47268 c -1.078657,-1.07864 -2.851011,-0.72465 
                -3.791155,0.41805 z"
                id="path8537"
              />
            </g>
          </svg>
            `;
    } else if (state.array[i] == "o") {
      console.log("putting o");
      box.innerHTML = `
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="300"
            height="300"
            viewBox="0 0 79.374999 79.374999"
            version="1.1"
            id="svg8551"
          >
            <g
              id="layer1"
              transform="translate(0,-217.625)"
            >
              <path
                style="opacity:1;fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:none;
                stroke-width:0.47593662;stroke-linecap:square;stroke-linejoin:miter;
                stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:124.72441101;
                stroke-opacity:1;paint-order:stroke fill markers"
                d="M 39.687498,237.46875 A 19.843726,19.843724 0 0 0 19.84375,257.3125 
                19.843726,19.843724 0 0 0 39.687498,277.15625 19.843726,19.843724 0 0 0 
                59.53125,257.3125 19.843726,19.843724 0 0 0 39.687498,237.46875 Z m 0,5.34246 
                A 14.501184,14.501182 0 0 1 54.188535,257.3125 14.501184,14.501182 0 0 1 
                39.687498,271.81354 14.501184,14.501182 0 0 1 25.186213,257.3125 
                14.501184,14.501182 0 0 1 39.687498,242.81121 Z"
                id="path815"
              />
            </g>
          </svg>
            `;
    } else {
      box.innerHTML = " ";
      console.log("clearing box");
    }
  });
}

/**
 * Detrrmines if anyone has won and, if so, the boxes that have formed a line
 *
 * ---
 * @returns {{ winner: String, matches: Array<Number> }} The winner, if any and the boxes which have formed a line
 */
function processMove() {
  let winner = undefined;
  let matches = [];

  for (let i = 0; i < 3; i++) {
    if (
      state.array[i] == state.array[i + 3] &&
      state.array[i + 3] == state.array[i + 6] &&
      state.array[i] != " "
    ) {
      winner = state.array[i];
      matches.push(i, i + 3, i + 6);
    } else if (
      state.array[i * 3] == state.array[i * 3 + 1] &&
      state.array[i * 3 + 1] == state.array[i * 3 + 2] &&
      state.array[i * 3] != " "
    ) {
      winner = state.array[i * 3];
      matches.push(i * 3, i * 3 + 1, i * 3 + 2);
    }
  }
  if (
    state.array[0] == state.array[4] &&
    state.array[4] == state.array[8] &&
    state.array[0] != " "
  ) {
    winner = state.array[0];
    matches.push(0, 4, 8);
  } else if (
    state.array[2] == state.array[4] &&
    state.array[4] == state.array[6] &&
    state.array[2] != " "
  ) {
    winner = state.array[2];
    matches.push(2, 4, 6);
  }

  return { winner, matches };
}

/**
 * calls `callBkFunc` on all the DOM elements of each square in the game
 *
 * ---
 * @param {Function} callBkFunc callback function
 */
function forAllDOMBoxes(callBkFunc) {
  let i = 0;
  for (let box of DOMBoxes) {
    callBkFunc(box, i);
    i++;
  }
}