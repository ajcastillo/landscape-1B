// Vocabulary definition for the game
// Each object has an 'image' (URL or local path) and the correct 'word' in English.
let vocabulary = []; // Will be loaded from JSON

let currentQuestionIndex = 0;
let score = 0;
let shuffledVocabulary = [];

// DOM Elements
const gameImage = document.getElementById('game-image');
const optionsGrid = document.getElementById('options-grid');
const feedbackMessage = document.getElementById('feedback-message');
const scoreDisplay = document.getElementById('score');
const totalQuestionsDisplay = document.getElementById('total-questions');
const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
const incorrectAnswerOverlay = document.getElementById('incorrect-answer-overlay');
const correctAnswerTextElement = document.getElementById('correct-answer-text');

// Chequeo inicial de elementos críticos para el overlay de error
if (!incorrectAnswerOverlay) {
    console.error("CRITICAL: El elemento con id 'incorrect-answer-overlay' no se encontró en el HTML.");
}
if (!correctAnswerTextElement) {
    console.error("CRITICAL: El elemento con id 'correct-answer-text' no se encontró en el HTML.");
}

// --- Funciones para el Confeti ---
function createAndAnimateParticle() {
    const particle = document.createElement('div');
    particle.classList.add('confetti-particle');

    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 8; // Tamaño entre 8px y 16px

    particle.style.backgroundColor = randomColor;
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = '-20px'; // Empezar justo encima de la pantalla
    particle.style.width = size + 'px';
    particle.style.height = (Math.random() > 0.3 ? size : size / 2) + 'px'; // Algunos cuadrados, otros rectángulos
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'; // Algunos círculos, otros cuadrados/rectángulos

    document.body.appendChild(particle);

    const fallDuration = Math.random() * 2000 + 3000; // 3-5 segundos para caer
    const horizontalMovement = (Math.random() - 0.5) * 250; // Movimiento horizontal aleatorio
    const initialRotation = Math.random() * 360;
    const finalRotation = initialRotation + (Math.random() - 0.5) * 720; // Gira mientras cae

    const animation = particle.animate([
        { transform: `translateY(0px) translateX(0px) rotate(${initialRotation}deg)`, opacity: 1 },
        { transform: `translateY(${window.innerHeight + 30}px) translateX(${horizontalMovement}px) rotate(${finalRotation}deg)`, opacity: 0 }
    ], {
        duration: fallDuration,
        easing: 'ease-out',
        fill: 'forwards' // Asegura que la opacidad se mantenga en 0 al final
    });

    animation.onfinish = () => {
        if (particle) {
            particle.remove();
        }
    };
}

function triggerConfetti(count = 60) { // Número de partículas de confeti
    for (let i = 0; i < count; i++) {
        // Crear partículas con un pequeño retraso para un efecto más fluido
        setTimeout(createAndAnimateParticle, i * 25);
    }
}
// --- Fin Funciones para el Confeti ---

// --- Funciones para el Overlay de Respuesta Incorrecta ---
function showIncorrectAnswerOverlay(correctWord) {
    console.log("Intentando mostrar overlay de respuesta incorrecta para:", correctWord);
    if (correctAnswerTextElement) {
        correctAnswerTextElement.textContent = correctWord;
        console.log("Texto de respuesta correcta establecido:", correctWord);
    } else {
        console.error("Elemento 'correctAnswerTextElement' es nulo al intentar mostrar overlay.");
    }
    if (incorrectAnswerOverlay) {
        incorrectAnswerOverlay.classList.add('visible');
        console.log("Clase 'visible' añadida a 'incorrectAnswerOverlay'. Clases actuales:", incorrectAnswerOverlay.classList.toString());
    } else {
        console.error("Elemento 'incorrectAnswerOverlay' es nulo al intentar mostrar overlay.");
    }
}

function hideIncorrectAnswerOverlay() {
    console.log("Intentando ocultar overlay de respuesta incorrecta.");
    if (incorrectAnswerOverlay) {
        incorrectAnswerOverlay.classList.remove('visible');
        console.log("Clase 'visible' eliminada de 'incorrectAnswerOverlay'. Clases actuales:", incorrectAnswerOverlay.classList.toString());
    } else {
        console.error("Elemento 'incorrectAnswerOverlay' es nulo al intentar ocultar overlay.");
    }
}
// --- Fin Funciones Overlay ---
// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to initialize and start the game (called after vocabulary is loaded)
function initializeGame() {
    score = 0;
    currentQuestionIndex = 0;
    if (vocabulary.length === 0) {
        console.error("Vocabulary is empty. Cannot start game.");
        feedbackMessage.textContent = "Error: Could not load vocabulary data.";
        feedbackMessage.classList.add('incorrect');
        // Disable buttons or show a more prominent error
        if(nextButton) nextButton.disabled = true;
        if(restartButton) restartButton.disabled = true;
        return;
    }
    shuffledVocabulary = shuffleArray([...vocabulary]); // Shuffled copy of vocabulary
    totalQuestionsDisplay.textContent = shuffledVocabulary.length;
    scoreDisplay.textContent = score;
    feedbackMessage.textContent = '';
    feedbackMessage.classList.remove('correct', 'incorrect', 'animate-pulse');
    nextButton.classList.add('hidden');
    if(nextButton) nextButton.disabled = false; // Re-enable if previously disabled
    if(restartButton) restartButton.disabled = false; // Re-enable
    restartButton.textContent = 'Restart Game';
    loadQuestion();
}

// Function to load a new question
function loadQuestion() {
    if (currentQuestionIndex >= shuffledVocabulary.length) {
        showFinalScore();
        return;
    }

    const currentItem = shuffledVocabulary[currentQuestionIndex];
    gameImage.src = currentItem.image;
    gameImage.alt = `Image of ${currentItem.word}`;
    gameImage.onerror = function() {
        this.onerror=null;
        this.src='https://placehold.co/600x300/e0f2fe/777777?text=Image+Not+Found+-+'+currentItem.word;
        this.alt = `Error loading image for ${currentItem.word}. Placeholder shown.`;
    };

    optionsGrid.innerHTML = ''; // Clear previous options
    feedbackMessage.textContent = '';
    feedbackMessage.classList.remove('correct', 'incorrect', 'animate-pulse');
    nextButton.classList.add('hidden'); // Asegurarse de que el botón "Next" se oculte

    // Generate options: 1 correct and 2 incorrect
    const correctAnswer = currentItem.word;
    let options = [correctAnswer];

    const incorrectAnswers = shuffledVocabulary
        .filter(item => item.word !== correctAnswer)
        .map(item => item.word);

    const shuffledIncorrect = shuffleArray([...new Set(incorrectAnswers)]);

    for(let i=0; options.length < 3 && i < shuffledIncorrect.length; i++) {
        if (!options.includes(shuffledIncorrect[i])) {
             options.push(shuffledIncorrect[i]);
        }
    }
    while (options.length < 3 && shuffledVocabulary.length > 2) {
         let randomWord = shuffledVocabulary[Math.floor(Math.random() * shuffledVocabulary.length)].word;
         if (!options.includes(randomWord)) {
            options.push(randomWord);
         }
    }
     while (options.length < 3) { // Fallback if not enough unique words
        options.push(`Option ${options.length + 1}`);
    }

    options = shuffleArray(options);

    options.forEach(optionText => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option-button');
        button.addEventListener('click', () => handleOptionClick(optionText, correctAnswer));
        optionsGrid.appendChild(button);
    });
}

// Function to handle option click
function handleOptionClick(selectedOption, correctAnswer) {
    console.log("handleOptionClick - Seleccionado:", selectedOption, "| Correcto:", correctAnswer);
    document.querySelectorAll('.option-button').forEach(btn => btn.disabled = true);
    feedbackMessage.classList.remove('animate-pulse', 'correct', 'incorrect');
    // Ocultar siempre el botón "Next" inicialmente; se mostrará si es necesario.
    nextButton.classList.add('hidden');

    if (selectedOption === correctAnswer) {
        console.log("Respuesta CORRECTA");
        score++;
        scoreDisplay.textContent = score;
        feedbackMessage.textContent = 'Correct! 🎉';
        feedbackMessage.classList.add('correct');
        feedbackMessage.classList.add('animate-pulse'); // Activar animación de pulso
        triggerConfetti(); // Activar animación de confeti

        // Quitar la clase de animación de pulso después de que termine para permitir que se reactive
        setTimeout(() => {
            if (feedbackMessage) { // Buena práctica: verificar si el elemento aún existe
                feedbackMessage.classList.remove('animate-pulse');
            }
        }, 800); // Debe coincidir con la duración de la animación CSS (0.8s)
        // Avanzar automáticamente después de un breve retraso
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex >= shuffledVocabulary.length) {
                showFinalScore();
            } else {
                loadQuestion();
            }
        }, 2500); // 2.5 segundos de retraso para ver la animación
    } else {
        console.log("Respuesta INCORRECTA");
        // Lógica para respuesta incorrecta
        feedbackMessage.textContent = ''; // Limpiar mensaje de feedback normal

        showIncorrectAnswerOverlay(correctAnswer);

        setTimeout(() => {
            console.log("Timeout para respuesta incorrecta ejecutado.");
            hideIncorrectAnswerOverlay(); // Ocultar overlay
            currentQuestionIndex++;
            if (currentQuestionIndex >= shuffledVocabulary.length) {
                showFinalScore();
            } else {
                loadQuestion();
            }
        }, 3000); // 3 segundos
    }

    // Mostrar el botón "Next" solo si la respuesta fue correcta
    if (selectedOption === correctAnswer) {
        nextButton.classList.remove('hidden');
        if (currentQuestionIndex >= shuffledVocabulary.length - 1) {
            nextButton.textContent = 'View Final Score';
        } else {
            nextButton.textContent = 'Next';
        }
    }
}

// Function to show the final score
function showFinalScore() {
    hideIncorrectAnswerOverlay(); // Asegurarse de que el overlay de respuesta incorrecta esté oculto
    gameImage.src = `https://placehold.co/600x300/e0f2fe/0c4a6e?text=Game+Over!`;
    gameImage.alt = "Game Over";
    optionsGrid.innerHTML = '';
    feedbackMessage.textContent = `Game complete! Your final score is ${score} out of ${shuffledVocabulary.length}.`;
    feedbackMessage.classList.remove('incorrect', 'animate-pulse'); // Limpiar estados no deseados
    feedbackMessage.classList.add('correct'); // Estilo de mensaje final "correcto"
    nextButton.classList.add('hidden');
    restartButton.textContent = 'Play Again';
}

// Event listeners for control buttons
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

restartButton.addEventListener('click', initializeGame); // Restart button now calls initializeGame

// Start the game when the page loads
// Load vocabulary first, then start the game
window.onload = async () => {
    try {
        const response = await fetch('vocabulary.json'); // Asegúrate que la ruta es correcta
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        vocabulary = await response.json();
        initializeGame(); // Start the game after vocabulary is loaded
    } catch (error) {
        console.error("Could not load vocabulary:", error);
        feedbackMessage.textContent = "Failed to load game data. Please try refreshing the page.";
        feedbackMessage.classList.add('incorrect');
    }
};
