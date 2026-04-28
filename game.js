// Question bank - loaded from external file
let questions = [];

// Load questions from JSON file
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        console.log('Questions loaded successfully:', questions.length);
    })
    .catch(error => {
        console.error('Error loading questions:', error);
    });

let gameState = {
    active: false,
    scores: { 1: 0, 2: 0 },
    currentQuestions: { 1: null, 2: null },
    usedQuestions: { 1: new Set(), 2: new Set() },
    displays: { 1: "0", 2: "0" }
};

function setTeamColumnsBlocked(blocked) {
    document.querySelectorAll('.team-column').forEach((column) => {
        column.classList.toggle('blocked', blocked);
    });
}

function setTugCenterLineHidden(hidden) {
    const centerLine = document.querySelector('.tug-center-line');
    if (!centerLine) return;
    centerLine.style.display = hidden ? 'none' : 'block';
}

function getRandomQuestion(team) {
    const available = questions.filter((_, idx) => !gameState.usedQuestions[team].has(idx));
    if (available.length === 0) {
        gameState.usedQuestions[team].clear();
        return getRandomQuestion(team);
    }
    const randomIdx = Math.floor(Math.random() * questions.length);
    if (!gameState.usedQuestions[team].has(randomIdx)) {
        gameState.usedQuestions[team].add(randomIdx);
        return questions[randomIdx];
    }
    return getRandomQuestion(team);
}

function startGame() {
    if (gameState.active) return;
    
    gameState.active = true;
    setTeamColumnsBlocked(false);
    setTugCenterLineHidden(false);
    gameState.scores = { 1: 0, 2: 0 };
    gameState.usedQuestions = { 1: new Set(), 2: new Set() };

    const tugVideo = document.getElementById('tugVideo');
    if (tugVideo) {
        tugVideo.src = 'assets/idle.mp4';
        tugVideo.loop = true;
        tugVideo.currentTime = 0;
        tugVideo.play().catch(() => {});
    }
    
    updateScore(1);
    updateScore(2);
    updateTugVideoPosition();
    
    loadNewQuestion(1);
    loadNewQuestion(2);
    
    document.getElementById('status').textContent = 'Game in progress - First to 10 wins!';
    document.getElementById('currentQuestionText').textContent = 'Both teams have their questions!';
}

function loadNewQuestion(team) {
    const question = getRandomQuestion(team);
    gameState.currentQuestions[team] = question;
    document.getElementById(`question${team}`).textContent = question.question;
}

function appendNumber(team, num) {
    if (!gameState.active) return;
    
    if (gameState.displays[team] === "0") {
        gameState.displays[team] = num;
    } else {
        gameState.displays[team] += num;
    }
    document.getElementById(`display${team}`).textContent = gameState.displays[team];
}

function clearDisplay(team) {
    gameState.displays[team] = "0";
    document.getElementById(`display${team}`).textContent = "0";
}

function submitAnswer(team) {
    if (!gameState.active) return;
    
    const userAnswer = gameState.displays[team];
    const correctAnswer = gameState.currentQuestions[team].answer;
    
    if (userAnswer === correctAnswer) {
        gameState.scores[team]++;
        updateScore(team);
        updateTugVideoPosition();
        
        // Flash the question display
        const questionDisplay = document.getElementById(`question${team}`);
        questionDisplay.style.background = '#27ae60';
        questionDisplay.style.color = 'white';
        setTimeout(() => {
            questionDisplay.style.background = '#f8f9fa';
            questionDisplay.style.color = '#333';
        }, 500);
        
        if (gameState.scores[team] >= 10) {
            endGame(team);
            return;
        }
        
        loadNewQuestion(team);
        clearDisplay(team);
        
        document.getElementById('status').textContent = `Team ${team} scored! 🎯`;
    } else {
        // Flash red for wrong answer
        const questionDisplay = document.getElementById(`question${team}`);
        questionDisplay.style.background = '#e74c3c';
        questionDisplay.style.color = 'white';
        setTimeout(() => {
            questionDisplay.style.background = '#f8f9fa';
            questionDisplay.style.color = '#333';
        }, 500);
    }
}

function updateScore(team) {
    document.getElementById(`score${team}`).textContent = gameState.scores[team];
}

function updateTugLinePosition() {
    const centerLine = document.querySelector('.tug-center-line');
    if (!centerLine) return;

    const scoreDelta = gameState.scores[1] - gameState.scores[2];
    const maxOffset = 180;
    const offsetPerPoint = 18;
    const offset = Math.max(-maxOffset, Math.min(maxOffset, scoreDelta * offsetPerPoint));

    centerLine.style.transform = `translateX(calc(-50% + ${offset}px))`;
}

function updateTugVideoPosition() {
    const tugVideo = document.getElementById('tugVideo');
    if (!tugVideo) return;

    const scoreDelta = gameState.scores[2] - gameState.scores[1];
    const maxOffset = 180;
    const offsetPerPoint = 18;
    const offset = Math.max(-maxOffset, Math.min(maxOffset, scoreDelta * offsetPerPoint));

    tugVideo.style.transform = `translateX(${offset}px)`;
}

function endGame(winner) {
    gameState.active = false;
    setTeamColumnsBlocked(true);
    setTugCenterLineHidden(true);
    document.getElementById('status').textContent = `🏆 Team ${winner} WINS! 🏆`;

    const tugVideo = document.getElementById('tugVideo');
    if (tugVideo) {
        tugVideo.style.transform = 'translateX(0px)';        
        tugVideo.src = winner === 1 ? 'assets/win-blue-left.mp4' : 'assets/win-red-right.mp4';
        tugVideo.loop = false;
        tugVideo.currentTime = 0;
        tugVideo.play().catch(() => {});
    }
}

function resetGame() {
    gameState = {
        active: false,
        scores: { 1: 0, 2: 0 },
        currentQuestions: { 1: null, 2: null },
        usedQuestions: { 1: new Set(), 2: new Set() },
        displays: { 1: "0", 2: "0" }
    };

    setTeamColumnsBlocked(true);
    setTugCenterLineHidden(false);
    
    updateScore(1);
    updateScore(2);
    updateTugVideoPosition();
    clearDisplay(1);
    clearDisplay(2);
    
    document.getElementById('question1').textContent = 'Waiting for game to start...';
    document.getElementById('question2').textContent = 'Waiting for game to start...';
    document.getElementById('status').textContent = 'Press START to begin the game';
    document.getElementById('currentQuestionText').textContent = 'No active question';

    const tugVideo = document.getElementById('tugVideo');
    if (tugVideo) {
        tugVideo.src = 'assets/idle.mp4';
        tugVideo.loop = true;
        tugVideo.style.transform = 'translateX(0px)';        
        tugVideo.currentTime = 0;
        tugVideo.play().catch(() => {});
    }
}
