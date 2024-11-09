if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const addDeckBtn = document.getElementById("addDeckBtn");
    const deckNameInput = document.getElementById("deckName");
    const decksContainer = document.getElementById("decksContainer");

    const addCardBtn = document.getElementById("addCardBtn");
    const questionInput = document.getElementById("question");
    const answerInput = document.getElementById("answer");
    const mediaInput = document.getElementById("media");
    const flashcardsContainer = document.getElementById("flashcards");
    const flashcardForm = document.getElementById("flashcard-form");
    const deckTitle = document.getElementById("deckTitle");

    const darkModeToggle = document.getElementById("darkModeToggle");
    const challengeText = document.getElementById("challengeText");
    const challengeProgress = document.getElementById("challengeProgress");
    const rewardMessage = document.getElementById("rewardMessage");

    const startPomodoroBtn = document.getElementById("startPomodoro");
    const pomodoroStatus = document.getElementById("pomodoroStatus");
    const workTimeInput = document.getElementById("workTime");
    const breakTimeInput = document.getElementById("breakTime");

    let decks = [];
    let currentDeck = null;
    let completedCardsToday = 0;
    const dailyTarget = 20;
    let pomodoroTimer;

    // Load decks from local storage
    loadDecks();

    // Add a new deck
    addDeckBtn.addEventListener("click", () => {
        const deckName = deckNameInput.value.trim();
        if (deckName) {
            const newDeck = { name: deckName, flashcards: [] };
            decks.push(newDeck);
            saveDecks();
            renderDecks();
            deckNameInput.value = '';
        }
    });

    // Save decks to local storage
    function saveDecks() {
        localStorage.setItem('decks', JSON.stringify(decks));
    }

    // Load decks from local storage
    function loadDecks() {
        const storedDecks = localStorage.getItem('decks');
        if (storedDecks) {
            decks = JSON.parse(storedDecks);
            renderDecks();
        }
    }

    // Render decks with delete button
    function renderDecks() {
        decksContainer.innerHTML = '';
        decks.forEach((deck, index) => {
            const deckDiv = document.createElement('div');
            deckDiv.classList.add('deck');
            deckDiv.innerHTML = `<button class="deck-btn">${deck.name}</button>
                                 <button class="delete-deck-btn"><i class="fa fa-trash-can"></i></button>`;
            deckDiv.querySelector('.deck-btn').addEventListener('click', () => {
                currentDeck = index;
                showFlashcardForm(deck.name);
                renderFlashcards();
            });
            deckDiv.querySelector('.delete-deck-btn').addEventListener('click', () => {
                deleteDeck(index);
            });
            decksContainer.appendChild(deckDiv);
        });
    }

    // Delete deck
    function deleteDeck(index) {
        decks.splice(index, 1);
        saveDecks();
        renderDecks();
    }

    // Show flashcard form for selected deck
    function showFlashcardForm(deckName) {
        flashcardForm.style.display = 'block';
        deckTitle.textContent = deckName;
    }

    // Add a new flashcard
    addCardBtn.addEventListener("click", () => {
        const question = questionInput.value.trim();
        const answer = answerInput.value.trim();
        const mediaFile = mediaInput.files[0];
        let mediaUrl = '';

        if (mediaFile) {
            mediaUrl = URL.createObjectURL(mediaFile);
            saveMediaToLocalStorage(mediaFile);
        }

        if (question && answer) {
            const flashcard = {
                question,
                answer,
                media: mediaUrl,
                mediaType: mediaFile ? mediaFile.type.split('/')[0] : null,
                isAnswerVisible: false,
            };
            decks[currentDeck].flashcards.push(flashcard);
            saveDecks();
            renderFlashcards();
            questionInput.value = '';
            answerInput.value = '';
            mediaInput.value = '';
        }
    });

    // Save media to local storage
    function saveMediaToLocalStorage(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            localStorage.setItem(file.name, event.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Render flashcards for the current deck
    function renderFlashcards() {
        flashcardsContainer.innerHTML = '';
        const currentFlashcards = decks[currentDeck].flashcards;
        currentFlashcards.forEach((flashcard, index) => {
            const flashcardDiv = document.createElement('div');
            flashcardDiv.classList.add('flashcard');
            let mediaDisplay = '';

            if (flashcard.mediaType === 'image') {
                mediaDisplay = `<img src="${flashcard.media}" alt="image" width="200">`;
            } else if (flashcard.mediaType === 'video') {
                mediaDisplay = `<video src="${flashcard.media}" controls width="200"></video>`;
            } else if (flashcard.mediaType === 'audio') {
                mediaDisplay = `<audio src="${flashcard.media}" controls></audio>`;
            }

            flashcardDiv.innerHTML = `
                <div>${flashcard.question}</div>
                <button class="toggle">Show Answer</button>
                <div>${flashcard.isAnswerVisible ? flashcard.answer : ''}</div>
                <div>${mediaDisplay}</div>
                <button class="delete-btn"><i class="fa fa-trash-can"></i></button>
            `;

            const toggleBtn = flashcardDiv.querySelector('.toggle');
            const deleteBtn = flashcardDiv.querySelector('.delete-btn');

            toggleBtn.addEventListener('click', () => {
                flashcard.isAnswerVisible = !flashcard.isAnswerVisible;
                toggleBtn.textContent = flashcard.isAnswerVisible ? 'Hide Answer' : 'Show Answer';
                flashcardDiv.querySelector('div:nth-child(3)').textContent = flashcard.isAnswerVisible ? flashcard.answer : '';
            });

            // Delete flashcard
            deleteBtn.addEventListener('click', () => {
                deleteFlashcard(index);
            });

            flashcardsContainer.appendChild(flashcardDiv);
        });
    }

    // Delete flashcard function
    function deleteFlashcard(index) {
        decks[currentDeck].flashcards.splice(index, 1);
        saveDecks();
        renderFlashcards();
        updateChallengeProgress();
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Daily challenge logic
    function updateChallengeProgress() {
        completedCardsToday = decks[currentDeck].flashcards.length;
        challengeProgress.textContent = `Progress: ${completedCardsToday}/${dailyTarget}`;
        if (completedCardsToday >= dailyTarget) {
            rewardMessage.style.display = 'block';
        } else {
            rewardMessage.style.display = 'none';
        }
    }


    // Initialize challenge progress
    updateChallengeProgress();
});
document.addEventListener("DOMContentLoaded", () => {
    const startPomodoroBtn = document.getElementById("startPomodoro");
    const stopPomodoroBtn = document.getElementById("stopPomodoro");
    const resetPomodoroBtn = document.getElementById("resetPomodoro");
    const pomodoroStatus = document.getElementById("pomodoroStatus");
    const timeDisplay = document.getElementById("timeDisplay");
    const circle = document.getElementById("circle");

    let pomodoroTimer;
    let timeLeft;
    let isWorkSession = true;
    let isRunning = false;

    // Start the Pomodoro timer
    startPomodoroBtn.addEventListener('click', () => {
        if (!isRunning) {
            const workMinutes = parseInt(document.getElementById("workTime").value);
            timeLeft = workMinutes * 60;
            startTimer();
        }
    });

    // Stop the Pomodoro timer
    stopPomodoroBtn.addEventListener('click', () => {
        clearInterval(pomodoroTimer);
        circle.classList.add('stopped');
        isRunning = false;
    });

    // Reset the Pomodoro timer
    resetPomodoroBtn.addEventListener('click', () => {
        clearInterval(pomodoroTimer);
        circle.classList.remove('stopped');
        const workMinutes = parseInt(document.getElementById("workTime").value);
        timeLeft = workMinutes * 60;
        updateDisplay(timeLeft);
        isRunning = false;
    });

    function startTimer() {
        isRunning = true;
        circle.classList.remove('stopped');
        pomodoroTimer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(pomodoroTimer);
                pomodoroStatus.textContent = 'Session complete!';
                isRunning = false;
                return;
            }
            timeLeft--;
            updateDisplay(timeLeft);
        }, 1000);
    }

    function updateDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timeDisplay.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
});
// ***********************************
function maseg() {
    const mas = document.getElementById("rewardMessage");
    mas.style.display = "block";
}

function removMas() {
    const mas = document.getElementById("rewardMessage");
    mas.style.display = "none";

}
// *****************************************************