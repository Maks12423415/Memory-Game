// Tablica zawierająca obiekty reprezentujące karty
const cardsArray = [
  { name: "A", img: "A" },
  { name: "B", img: "B" },
  { name: "C", img: "C" },
  { name: "D", img: "D" },
  { name: "E", img: "E" },
  { name: "F", img: "F" },
  { name: "G", img: "G" },
  { name: "H", img: "H" },
];

// Licznik ruchów i punktów
let moves = 0;
let score = 0;

// Flaga wskazująca, czy pierwsza karta została odsłonięta
let hasFlippedCard = false;

// Flaga blokująca interakcję z kartami
let lockBoard = false;

// Referencje do elementów na stronie HTML
const memoryGame = document.getElementById("memory-game");
const movesCounter = document.getElementById("moves");
const scoreCounter = document.getElementById("score");
const restartButton = document.getElementById("restart");
const scoreForm = document.getElementById("score-form");
const playerNameInput = document.getElementById("player-name");
const scoresTableBody = document.querySelector("#scores-table tbody");

// Funkcja do losowego tasowania kart w tablicy
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// Funkcja generująca planszę gry
function createBoard() {
  // Podwójna tablica kart (każda karta występuje dwukrotnie)
  const doubleCardsArray = [...cardsArray, ...cardsArray];
  // Tasowanie kart
  shuffle(doubleCardsArray);
  // Tworzenie elementów HTML dla każdej karty
  doubleCardsArray.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("memory-card");
    cardElement.dataset.name = card.name;

    cardElement.innerHTML = `
              <div class="front-face">${card.name}</div>
              <div class="back-face">?</div>
          `;

    cardElement.addEventListener("click", flipCard); // Dodanie obsługi zdarzenia kliknięcia na kartę
    memoryGame.appendChild(cardElement); // Dodanie karty do planszy gry
  });
}

// Deklaracja zmiennych firstCard i secondCard na początku pliku
let firstCard, secondCard;

// Funkcja obsługująca odsłanianie karty
function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flip"); // Obrócenie karty

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this; // Przypisanie wartości do zmiennej firstCard
    return;
  }

  secondCard = this; // Przypisanie wartości do zmiennej secondCard
  moves++;
  movesCounter.textContent = moves; // Zwiększenie licznika ruchów

  checkForMatch(); // Sprawdzenie, czy karty pasują do siebie
}

// Funkcja sprawdzająca, czy karty pasują do siebie
function checkForMatch() {
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    disableCards(); // Wyłączenie możliwości kliknięcia na pasujące karty
    score++; // Zwiększenie wyniku
    scoreCounter.textContent = score; // Aktualizacja wyniku na stronie
  } else {
    unflipCards(); // Obrócenie kart z powrotem
  }
}

// Funkcja wyłączająca możliwość kliknięcia na pasujące karty
function disableCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  resetBoard();
}

// Funkcja obracająca karty z powrotem, jeśli nie pasują do siebie
function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove("flip");
    secondCard.classList.remove("flip");

    resetBoard();
  }, 1500);
}

// Funkcja resetująca planszę gry po zakończeniu rundy
function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

// Funkcja restartująca grę
function restartGame() {
  memoryGame.innerHTML = ""; // Usunięcie wszystkich kart z planszy
  moves = 0;
  score = 0;
  movesCounter.textContent = moves;
  scoreCounter.textContent = score;
  createBoard(); // Wygenerowanie nowej planszy
  resetBoard();
}

// Funkcja do zapisywania wyniku do bazy danych
function saveScore(event) {
  event.preventDefault();

  const playerName = playerNameInput.value;

  fetch("save_score.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerName, score, moves }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Wynik zapisany!");
        loadScores(); // Załadowanie nowych wyników po zapisaniu
      } else {
        alert("Wystąpił błąd przy zapisywaniu wyniku.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Funkcja do ładowania wyników z bazy danych
function loadScores() {
  fetch("load_scores.php") // Pobranie danych z serwera
    .then((response) => response.json()) // Konwersja odpowiedzi na obiekt JSON
    .then((data) => {
      scoresTableBody.innerHTML = ""; // Wyczyszczenie tabeli z wynikami
      data.forEach((row) => {
        const tr = document.createElement("tr"); // Utworzenie nowego wiersza w tabeli
        tr.innerHTML = `
                      <td>${row.player_name}</td>
                      <td>${row.score}</td>
                      <td>${row.moves}</td>
                      <td>${row.date}</td>
                  `; // Dodanie danych o wyniku do wiersza
        scoresTableBody.appendChild(tr); // Dodanie wiersza do tabeli
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Dodanie obsługi zdarzenia kliknięcia na formularz zapisu wyniku
scoreForm.addEventListener("submit", saveScore);

// Dodanie obsługi zdarzenia kliknięcia na przycisk restartu gry
restartButton.addEventListener("click", restartGame);

// Wygenerowanie początkowej planszy gry i załadowanie wyników
createBoard();
loadScores();
