class QuestContest {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 10;
        this.questions = Array(10).fill().map((_, index) => ({
            id: index + 1,
            question: index === 0 ? "What do you think about this platform?" :
                     index === 1 ? "How would you rate your experience with our services?" :
                     "What features would you like to see in the future?",
            answer: "",
            timeLeft: 300, // 5 minutes per question
            isComplete: false
        }));
        this.timer = null;
        this.isContestComplete = false;

        this.init();
    }

    init() {
        // Initialize elements
        this.questionNumberEl = document.querySelector('.question-counter .text-dark');
        this.questionEl = document.querySelector('.quest-body .question');
        this.textareaEl = document.querySelector('.quest-body textarea');
        this.prevBtn = document.querySelector('.quest-navigation button:first-child');
        this.nextBtn = document.querySelector('.quest-navigation button:last-child');
        this.timerEl = document.querySelector('.timer-wrapper .time');

        // Initialize tab elements
        this.storyTab = document.getElementById('story-tab');
        this.contestTab = document.getElementById('contest-tab');
        this.resultTab = document.getElementById('contest-result-tab');

        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.navigateQuestion('prev'));
        this.nextBtn.addEventListener('click', () => this.navigateQuestion('next'));
        this.textareaEl.addEventListener('input', (e) => this.saveAnswer(e.target.value));

        // Add tab event listeners
        this.storyTab.addEventListener('show.bs.tab', (e) => this.handleTabChange(e));
        this.contestTab.addEventListener('show.bs.tab', (e) => this.handleTabChange(e));
        this.resultTab.addEventListener('show.bs.tab', (e) => this.handleTabChange(e));

        // Initialize first question
        this.updateQuestion();
        this.startTimer();

        // Load saved state if exists
        this.loadSavedState();
    }

    handleTabChange(event) {
        const targetTab = event.target.id;

        // If switching away from contest tab, save the state
        if (event.target.id !== 'contest-tab') {
            this.saveState();
            this.pauseTimer(); // Pause timer when switching tabs
        } else {
            this.startTimer(); // Resume timer when coming back to contest
        }
    }

    navigateQuestion(direction) {
        // Save current answer and stop current timer
        this.saveAnswer(this.textareaEl.value);
        this.pauseTimer();

        // Update current question
        if (direction === 'next' && this.currentQuestion < this.totalQuestions) {
            this.currentQuestion++;
        } else if (direction === 'prev' && this.currentQuestion > 1) {
            this.currentQuestion--;
        }

        // Check if this is the last question and all questions are answered and completed
        if (this.currentQuestion === this.totalQuestions) {
            const allCompleted = this.questions.every(q => q.isComplete);
            if (allCompleted) {
                this.isContestComplete = true;
                this.showSubmitOption();
            }
        }

        // Update UI and start new timer
        this.updateQuestion();
        this.startTimer();
        this.updateNavigationButtons();
        this.saveState();
    }

    showSubmitOption() {
        // Change the next button to submit if all questions are answered
        this.nextBtn.textContent = 'Submit Contest';
        this.nextBtn.addEventListener('click', this.submitContest.bind(this), { once: true });
    }

    submitContest() {
        // Save final state
        this.saveState();
        
        // Show results tab
        const resultTab = new bootstrap.Tab(this.resultTab);
        resultTab.show();
        
        // Update results content
        this.displayResults();
    }

    displayResults() {
        const resultContainer = document.querySelector('#contest-result-tab-pane .contest-result-body');
        
        // Show winner section by default
        if (!this.isContestComplete) {
            resultContainer.innerHTML = this.getWinnerSectionHTML();
            return;
        }

        // If contest is complete, show personal results
        let resultsHTML = '';
        this.questions.forEach((q, index) => {
            resultsHTML += `
                <div class="result-item">
                    <div class="result-item-header">
                        <div class="question-number">Question ${index + 1}</div>
                        <div class="question-text">${q.question}</div>
                    </div>
                    <div class="result-item-body">
                        <div class="answer-box">
                            ${q.answer || 'No answer provided'}
                        </div>
                    </div>
                </div>
            `;
        });
        resultContainer.innerHTML = resultsHTML;
    }

    getWinnerSectionHTML() {
        return `
            <div class="winner-section">
                <div class="winner-card">
                    <div class="winner-image">
                        <img src="assets/images/pictures/winner-image.jpg" alt="Winner" class="img-fluid rounded-circle">
                        <div class="winner-badge">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 15L8.5 17L9.5 13L6.5 10.5L10.5 10L12 6L13.5 10L17.5 10.5L14.5 13L15.5 17L12 15Z" fill="#FFD700"/>
                            </svg>
                        </div>
                    </div>
                    <div class="winner-info">
                        <h4>Congratulations!</h4>
                        <p class="winner-name">John Smith</p>
                        <p class="winner-score">Score: 95/100</p>
                    </div>
                </div>
                <div class="leaderboard">
                    <div class="leaderboard-header">
                        <h5>Top Performers</h5>
                    </div>
                    <div class="leaderboard-list">
                        <div class="leaderboard-item">
                            <div class="rank">1</div>
                            <div class="participant-info">
                                <img src="assets/images/pictures/user1.jpg" alt="User" class="participant-image">
                                <span class="participant-name">John Smith</span>
                            </div>
                            <div class="score">95</div>
                        </div>
                        <div class="leaderboard-item">
                            <div class="rank">2</div>
                            <div class="participant-info">
                                <img src="assets/images/pictures/user2.jpg" alt="User" class="participant-image">
                                <span class="participant-name">Emma Wilson</span>
                            </div>
                            <div class="score">92</div>
                        </div>
                        <div class="leaderboard-item">
                            <div class="rank">3</div>
                            <div class="participant-info">
                                <img src="assets/images/pictures/user3.jpg" alt="User" class="participant-image">
                                <span class="participant-name">Michael Brown</span>
                            </div>
                            <div class="score">88</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    startTimer() {
        // Clear any existing timer
        this.pauseTimer();
        
        const currentQuestionData = this.questions[this.currentQuestion - 1];
        
        // Initialize timeLeft if it's undefined
        if (typeof currentQuestionData.timeLeft !== 'number' || isNaN(currentQuestionData.timeLeft)) {
            currentQuestionData.timeLeft = 300;
        }
        
        // Don't start timer if question is already complete
        if (currentQuestionData.isComplete) {
            this.updateTimerDisplay(currentQuestionData.timeLeft);
            return;
        }

        this.timer = setInterval(() => {
            if (typeof currentQuestionData.timeLeft === 'number' && currentQuestionData.timeLeft > 0) {
                currentQuestionData.timeLeft--;
                this.updateTimerDisplay(currentQuestionData.timeLeft);
                
                if (currentQuestionData.timeLeft <= 0) {
                    this.handleQuestionTimeUp();
                }
            } else {
                this.pauseTimer();
            }
        }, 1000);

        this.updateTimerDisplay(currentQuestionData.timeLeft);
    }

    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleQuestionTimeUp() {
        const currentQuestionData = this.questions[this.currentQuestion - 1];
        
        // Mark current question as complete
        currentQuestionData.isComplete = true;
        this.pauseTimer();
        
        // Save the current state
        this.saveState();
        
        // Show alert and auto-navigate to next question if available
        alert(`Time's up for Question ${this.currentQuestion}!`);
        
        if (this.currentQuestion < this.totalQuestions) {
            this.navigateQuestion('next');
        } else {
            // If this was the last question, check if all questions are complete
            const allCompleted = this.questions.every(q => q.isComplete);
            if (allCompleted) {
                this.isContestComplete = true;
                this.submitContest();
            }
        }
    }

    updateTimerDisplay(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds)) {
            seconds = 300; // Default to 5 minutes if invalid
        }
        const minutes = Math.floor(Math.max(0, seconds) / 60);
        const remainingSeconds = Math.max(0, seconds) % 60;
        if (this.timerEl) {
            this.timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        }
    }

    saveAnswer(answer) {
        const currentQuestionData = this.questions[this.currentQuestion - 1];
        currentQuestionData.answer = answer;
        
        // If there's an answer and time left, consider the question complete
        if (answer.trim() !== '' && currentQuestionData.timeLeft > 0) {
            currentQuestionData.isComplete = true;
        }
        
        this.saveState();
    }

    updateQuestion() {
        const question = this.questions[this.currentQuestion - 1];
        
        // Update question number
        this.questionNumberEl.textContent = this.currentQuestion;
        
        // Update question text
        this.questionEl.textContent = question.question;
        
        // Update textarea with saved answer
        this.textareaEl.value = question.answer || '';
        
        // Update timer display
        this.updateTimerDisplay(question.timeLeft);

        // If question is complete, disable textarea
        this.textareaEl.disabled = question.isComplete;

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        // Disable/enable previous button
        this.prevBtn.disabled = this.currentQuestion === 1;
        
        // Disable/enable next button
        if (this.isContestComplete) {
            this.nextBtn.textContent = 'Submit Contest';
        } else {
            this.nextBtn.textContent = 'Next Question';
            this.nextBtn.disabled = this.currentQuestion === this.totalQuestions;
        }
    }

    saveState() {
        const state = {
            currentQuestion: this.currentQuestion,
            questions: this.questions,
            isContestComplete: this.isContestComplete
        };
        localStorage.setItem('contestState', JSON.stringify(state));
    }

    loadSavedState() {
        const savedState = localStorage.getItem('contestState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.currentQuestion = state.currentQuestion || 1;
                
                // Ensure questions array is properly initialized with timeLeft values
                if (state.questions && Array.isArray(state.questions)) {
                    state.questions.forEach((q, index) => {
                        if (this.questions[index]) {
                            this.questions[index] = {
                                ...this.questions[index],
                                ...q,
                                timeLeft: typeof q.timeLeft === 'number' ? q.timeLeft : 300
                            };
                        }
                    });
                }
                
                this.isContestComplete = state.isContestComplete || false;

                if (this.isContestComplete) {
                    this.displayResults();
                }

                this.updateQuestion();
                this.updateNavigationButtons();
            } catch (error) {
                console.error('Error loading saved state:', error);
                // Reset to default state if there's an error
                this.currentQuestion = 1;
                this.questions.forEach(q => {
                    q.timeLeft = 300;
                    q.isComplete = false;
                });
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.quest-contest')) {
        new QuestContest();
    }
}); 