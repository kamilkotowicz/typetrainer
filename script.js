const DIGITS_IN_WORD = 10;
const MAX_NUMBER = 1e4;
var TIMER_DURATION_SECONDS = 60; 
var USER_INPUT = document.getElementById("userInput");
var SEQUENCE = document.getElementById('sequence');
var WPM_RESULT = document.getElementById('wpmResult');
var TIMER = document.getElementById('timer');
var timerInterval;

var roundStarted = null;
var lastDigitWrited = null;

var digitSequence = [];
var currentDigitIndex = 0;
var digitStats = loadStats() || new Array(MAX_NUMBER).fill(0);
var roundNumber = 0;
var totalDigits = 0;

function writeAnswer(event) {
    if (event.key.length == 1 && event.key >= '0' && event.key <= '9') {
      const answer = event.key - 0;
      const expected = digitSequence[currentDigitIndex];

      if (answer === expected) {
        USER_INPUT.innerHTML += `<span class="correct">${event.key}</span>`;
        ++currentDigitIndex;
        ++totalDigits;
        if (currentDigitIndex === 1) {
          if(roundNumber == 1){
            startTimer();
            roundStarted = new Date();
            totalDigits = 0;
          }
          
        } else {
          const last_elapsed = (new Date() - lastDigitWrited) / 1000;
          const elapsed = (new Date() - roundStarted) / 1000;
          const wpm = 60 * totalDigits / 5 / elapsed;
          WPM_RESULT.innerText = (wpm.toFixed(0) + ' WPM\n');
          if (currentDigitIndex === DIGITS_IN_WORD) {
            startNewRound();
          }
        }
        lastDigitWrited = new Date();
      }
    }
  }

function loadStats(){
    return false;
}

function generateDigitSequence(){
    var digits = new Array(DIGITS_IN_WORD);

    for(let i = 0; i < DIGITS_IN_WORD; ++i){
        var digit = Math.floor(Math.random() * 10);
        digits[i] = digit;
    }
    return digits;
}

function startNewRound() {
    digitSequence = generateDigitSequence();
    SEQUENCE.innerText = digitSequence.join('');
    USER_INPUT.innerText = '';
    currentDigitIndex = 0;
    ++roundNumber;
}

function setTimer(seconds) {
    TIMER_DURATION_SECONDS = seconds;
    switch(seconds){
        case 15: TIMER.innerText = '00:15'; break;
        case 30: TIMER.innerText = '00:30'; break;
        case 60: TIMER.innerText = '01:00'; break;
        case 120: TIMER.innerText = '02:00'; break;
    }
}

function startTimer() {
    let remainingSeconds = TIMER_DURATION_SECONDS;
    updateTimer(remainingSeconds);

    timerInterval = setInterval(function () {
      remainingSeconds--;
      if (remainingSeconds >= 0) {
        updateTimer(remainingSeconds);
      } else {
        stopTimer();
        // Dodaj dowolną logikę, która ma być wykonana po zakończeniu czasu
        roundNumber = 0;
        alert('Czas minął!');
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    TIMER.innerText = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

window.addEventListener('keydown', writeAnswer);

document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});
