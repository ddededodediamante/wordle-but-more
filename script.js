const word = words[Math.floor(Math.random() * words.length)];
const game = document.getElementById("game");

let currentRow = 0;
let currentCol = 0;
let guess = "";
let roundFinished = false;
const maxAttempts = 6;

const rows = [];
for (let i = 0; i < maxAttempts; i++) {
  const row = document.createElement("div");
  row.className = "row";
  const tiles = [];
  for (let j = 0; j < 5; j++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    row.appendChild(tile);
    tiles.push(tile);
  }
  rows.push(tiles);
  game.appendChild(row);
}

function checkGuess() {
  const target = word.split("");
  const input = guess.split("");
  const color = ["absent", "absent", "absent", "absent", "absent"];

  const isVowel = (v) => "aeiou".includes(v);

  // 1) correct
  for (let i = 0; i < 5; i++) {
    if (input[i] === target[i]) {
      color[i] = "correct";
      target[i] = null;
    }
  }

  // 2) mirror
  for (let i = 0; i < 5; i++) {
    if (color[i] === "absent") {
      const mirrorIndex = 4 - i;
      if (input[i] === target[mirrorIndex]) {
        color[i] = "mirror";
        target[mirrorIndex] = null;
      }
    }
  }

  // 3) present
  for (let i = 0; i < 5; i++) {
    if (color[i] !== "correct" && color[i] !== "mirror") {
      const idx = target.indexOf(input[i]);
      if (idx !== -1) {
        color[i] = "present";
        target[idx] = null;
      }
    }
  }

  // 4) alphabet
  for (let i = 0; i < 5; i++) {
    if (color[i] === "absent") {
      const code = input[i].charCodeAt(0);
      const idx = target.findIndex(
        (l) => l !== null && Math.abs(l.charCodeAt(0) - code) === 1
      );
      if (idx !== -1) {
        color[i] = "alphabet";
        target[idx] = null;
      }
    }
  }

  // 5) keyboardic
  for (let i = 0; i < 5; i++) {
    if (color[i] === "absent") {
      const guessed = input[i];
      const idx = target.findIndex(
        (l) => l !== null && keyboardNeighbors[guessed]?.includes(l)
      );
      if (idx !== -1) {
        color[i] = "keyboardic";
        target[idx] = null;
      }
    }
  }

  // 6) phonetic
  for (let i = 0; i < 5; i++) {
    if (color[i] === "absent" && isVowel(input[i]) && isVowel(target[i])) {
      color[i] = "phonetic";
      target[i] = null;
    }
  }  

  // 7) ddededodediamante
  for (let i = 0; i < 5; i++) {
    if (color[i] === "absent") {
      if ("ddededodediamante".includes(input[i])) {
        color[i] = "ddededodediamante";
      }
    }
  }

  // apply to tiles and keyboard
  for (let i = 0; i < 5; i++) {
    const letter = input[i];
    const col = color[i];
    rows[currentRow][i].classList.add(col);

    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key) {
      const priority = [
        "correct",
        "mirror",
        "present",
        "alphabet",
        "keyboardic",
        "phonetic",
        "ddededodediamante",
        "absent",
      ];
      const currentIndex = priority.indexOf(col);
      const ex = priority.find((p) => key.classList.contains(p));
      const exI = ex ? priority.indexOf(ex) : Infinity;
      if (currentIndex < exI) {
        key.classList.remove(...priority);
        key.classList.add(col);
      }
    }
  }

  if (guess === word) setTimeout(() => alert("You won!"), 300);
  else if (currentRow === maxAttempts - 1)
    setTimeout(() => alert(`You lost! Word was "${word}".`), 300);

  currentRow++;
  currentCol = 0;
  guess = "";
}

const keyboardLayout = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "Backspace"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "Enter"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function createKeyboard() {
  const kb = document.getElementById("keyboard");
  keyboardLayout.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    row.forEach((key) => {
      const keyEl = document.createElement("button");
      keyEl.textContent = key === "Backspace" ? "←" : key;
      keyEl.dataset.key = key;
      keyEl.className = "key";
      if (key === "Enter" || key === "Backspace") keyEl.classList.add("wide");
      rowEl.appendChild(keyEl);

      keyEl.addEventListener("click", () => handleVirtualKey(key));
    });
    kb.appendChild(rowEl);
  });
}

function handleVirtualKey(key) {
  if (key === "Backspace") return handleBackspace();
  if (key === "Enter") return handleEnter();
  if (/^[a-zA-Z]$/.test(key)) return handleLetter(key);
}

function handleLetter(letter) {
  if (currentCol < 5) {
    rows[currentRow][currentCol].textContent = letter.toUpperCase();
    guess += letter.toLowerCase();
    currentCol++;
  }
}

function handleBackspace() {
  if (currentCol > 0) {
    currentCol--;
    guess = guess.slice(0, -1);
    rows[currentRow][currentCol].textContent = "";
  }
}

function handleEnter() {
  if (guess.length === 5 && allWords.includes(guess)) {
    checkGuess();
  }
}

document.addEventListener("keydown", (e) => {
  if (currentRow >= maxAttempts || roundFinished) return;
  if (e.key === "Backspace") return handleBackspace();
  if (e.key === "Enter") return handleEnter();
  if (/^[a-zA-Z]$/.test(e.key)) return handleLetter(e.key);
});

createKeyboard();

const helpBtn = document.getElementById("helpBtn");
const helpPopup = document.getElementById("helpPopup");
const closeHelp = document.getElementById("closeHelp");

helpBtn.addEventListener("click", () => {
  helpPopup.classList.remove("hidden");
});

closeHelp.addEventListener("click", () => {
  helpPopup.classList.add("hidden");
});
