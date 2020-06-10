const main = document.querySelector(".main");
const scroeElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const nextTetroElem = document.getElementById("next-tetro");
const pauseBtn = document.getElementById("pause");
const gameOver = document.getElementById("game-over");
const col = 10,
  row = 20,
  possibleLevels = {
    1: {
      scorePerLine: 10,
      speed: 400,
      nextLevelScore: 100,
    },
    2: {
      scorePerLine: 15,
      speed: 300,
      nextLevelScore: 500,
    },
    3: {
      scorePerLine: 20,
      speed: 200,
      nextLevelScore: 1000,
    },
    4: {
      scorePerLine: 30,
      speed: 100,
      nextLevelScore: 2000,
    },
    5: {
      scorePerLine: 50,
      speed: 50,
      nextLevelScore: Infinity,
    },
  },
  figures = {
    O: [
      [1, 1],
      [1, 1]
    ],
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    L: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    J: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    T: [
      [1, 1, 1], 
      [0, 1, 0], 
      [0, 0, 0] 
    ],
  };
let score = 0,
  gameTimerID,
  currentLevel = 1,
  isPaused = true,
  playfield = [];

for (let i = 0; i < row; i++) {
  playfield.push(Array(col).fill(0));
}
let activeTetro = getNewTetro();
let nextTetro = getNewTetro();
draw();
pauseBtn.addEventListener(
  "click",
  (e) => {
    if (e.target.innerHTML === "Start") {
      pauseBtn.blur();
      drawNextTetro();
      e.target.innerHTML = "Pause";
      scroeElem.innerHTML = score;
      levelElem.innerHTML = currentLevel;
      gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
      gameOver.style.display = "none";
    } else {
      e.target.innerHTML = "Start";
      clearTimeout(gameTimerID);
    }
    isPaused = !isPaused;
  },
  false
);

function getNewTetro() {
  const possibleFigures = "IOLJTSZ";
  const rand = Math.floor(Math.random() * 7);
  const newTetro = figures[possibleFigures[rand]];
  return {
    x: Math.floor((10 - newTetro[0].length) / 2),
    y: 0,
    shape: newTetro,
  };
}

function draw() {
  let mainInnerHTML = "";
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        mainInnerHTML += '<div class="cell movingCell"></div>';
      } else if (playfield[y][x] === 2) {
        mainInnerHTML += '<div class="cell fixedCell"></div>';
      } else {
        mainInnerHTML += '<div class="cell"></div>';
      }
    }
  }
  main.innerHTML = mainInnerHTML;
}

function startGame() {
  moveTetroDown();
  if (!isPaused) {
    updateGameState();
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
}

function moveTetroDown() {
  activeTetro.y += 1;
  if (hasCollisions()) {
    activeTetro.y -= 1;
    fixTetro();
    removeFullLines();
    activeTetro = nextTetro;
    nextTetro = getNewTetro();
    drawNextTetro();
    if (hasCollisions()) {
      reset();
    }
  }
}
function updateGameState() {
  addActiveTetro();
  draw();
}

function hasCollisions() {
  for (let y = 0; y < activeTetro.shape.length; y++) {
    for (let x = 0; x < activeTetro.shape[y].length; x++) {
      if (
        activeTetro.shape[y][x] &&
        (playfield[activeTetro.y + y] === undefined ||
          playfield[activeTetro.y + y][activeTetro.x + x] === undefined ||
          playfield[activeTetro.y + y][activeTetro.x + x] === 2)
      ) {
        return true;
      }
    }
  }
  return false;
}

function drawNextTetro() {
  let nextTetroInnerHTML = "";
  for (let y = 0; y < nextTetro.shape.length; y++) {
    for (let x = 0; x < nextTetro.shape[y].length; x++) {
      if (nextTetro.shape[y][x]) {
        nextTetroInnerHTML += '<div class="cell movingCell"></div>';
      } else {
        nextTetroInnerHTML += '<div class="cell"></div>';
      }
    }
    nextTetroInnerHTML += "<br/>";
  }
  nextTetroElem.innerHTML = nextTetroInnerHTML;
}

function removePrevActiveTetro() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 0;
      }
    }
  }
}

function addActiveTetro() {
  removePrevActiveTetro();
  for (let y = 0; y < activeTetro.shape.length; y++) {
    for (let x = 0; x < activeTetro.shape[y].length; x++) {
      if (activeTetro.shape[y][x] === 1) {
        playfield[activeTetro.y + y][activeTetro.x + x] =
          activeTetro.shape[y][x];
      }
    }
  }
}

function rotateTetro() {
  const prevTetroState = activeTetro.shape;
  activeTetro.shape = activeTetro.shape[0].map((val, index) =>
    activeTetro.shape.map((row) => row[index]).reverse()
  );
  if (hasCollisions()) {
    activeTetro.shape = prevTetroState;
  }
}

function removeFullLines() {
  let canRemoveLine = true,
    filledLines = 0;
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] !== 2) {
        canRemoveLine = false;
        break;
      }
    }
    if (canRemoveLine) {
      playfield.splice(y, 1);
      playfield.splice(0, 0, Array(10).fill(0));
      filledLines += 1;
    }
    canRemoveLine = true;
  }
  switch (filledLines) {
    case 1:
      score += possibleLevels[currentLevel].scorePerLine;
      scroeElem.innerHTML = score;
      break;
    case 2:
      score += possibleLevels[currentLevel].scorePerLine * 3;
      scroeElem.innerHTML = score;
      break;
    case 3:
      score += possibleLevels[currentLevel].scorePerLine * 6;
      scroeElem.innerHTML = score;
      break;
    case 4:
      score += possibleLevels[currentLevel].scorePerLine * 12;
      scroeElem.innerHTML = score;
      break;
  }
  if (score >= possibleLevels[currentLevel].nextLevelScore) {
    currentLevel++;
    levelElem.innerHTML = currentLevel;
  }
}

function getNewTetro() {
  const possibleFigures = "IOLJTSZ";
  const rand = Math.floor(Math.random() * 7);
  const newTetro = figures[possibleFigures[rand]];
  return {
    x: Math.floor((10 - newTetro[0].length) / 2),
    y: 0,
    shape: newTetro,
  };
}

function fixTetro() {
  for (let y = activeTetro.y; y < playfield.length; y++) {
    for (
      let x = activeTetro.x;
      x < activeTetro.x + activeTetro.shape.length;
      x++
    ) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 2;
      }
    }
  }
}

function dropTetro() {
  for (let y = activeTetro.y; y < playfield.length; y++) {
    activeTetro.y += 1;
    if (hasCollisions()) {
      activeTetro.y -= 1;
      break;
    }
  }
}

function reset() {
  pauseBtn.innerText = "Start";
  isPaused = true;
  clearTimeout(gameTimerID);
  score = 0;
  currentLevel = 1;
  playfield = [];
  for (let i = 0; i < row; i++) {
    playfield.push(Array(col).fill(0));
  }
  gameOver.style.display = "block";
}

document.addEventListener(
  "keydown",
  (e) => {
    if (!isPaused) {
      if (e.keyCode === 37) {
        activeTetro.x -= 1;
        if (hasCollisions()) {
          activeTetro.x += 1;
        }
      } else if (e.keyCode === 39) {
        activeTetro.x += 1;
        if (hasCollisions()) {
          activeTetro.x -= 1;
        }
      } else if (e.keyCode === 40) {
        moveTetroDown();
      } else if (e.keyCode === 38) {
        rotateTetro();
      } else if (e.keyCode === 32) {
        dropTetro();
      }
      updateGameState();
    }
  },
  false
);
