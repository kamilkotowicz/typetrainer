const DIGITS_IN_WORD = 10;
const MAX_NUMBER = 1e4;
const MODEL_INPUTS = 4;
var TIMER_DURATION_SECONDS = 60;
var USER_INPUT = document.getElementById("userInput");
var SEQUENCE = document.getElementById('sequence');
var WPM_RESULT = document.getElementById('wpmResult');
var TIMER = document.getElementById('timer');
var SMART_GENERATING_MODE = true;
var STATS_UPDATING = true;

var timerInterval;

var roundStarted = null;
var lastDigitWrited = null;

var digitSequence = [];
var currentDigitIndex = 0;
var digitStats = loadStats();
var modelWeights = loadModel();
var wordNumber = 0;
var totalDigits = 0;

function updateStats(duration){
    const LEARNING_RATE = 0.05;
    var s = "";
    var minx = Math.max(0, currentDigitIndex - MODEL_INPUTS + 1);
    for (let i = currentDigitIndex; i>= minx; --i){
        s = digitSequence[i] + s;
        if (!digitStats[s]) digitStats[s] = duration;
        else digitStats[s] = (1 - LEARNING_RATE) * digitStats[s] + LEARNING_RATE * duration;
    }
    // TODO: Dodac uczenie wag (wspolczynnikow w sieci)
}

function writeAnswer(event) {
    if (event.key.length == 1 && event.key >= '0' && event.key <= '9') {
        const answer = event.key - 0;
        const expected = digitSequence[currentDigitIndex];

        if (answer === expected) {
            USER_INPUT.innerHTML += `<span class="correct">${event.key}</span>`;
            ++totalDigits;
            if (currentDigitIndex === 0) {
                if (wordNumber == 1) {
                    startTimer();
                    roundStarted = new Date();
                    totalDigits = 0;
                }

            } else {
                const last_elapsed = (new Date() - lastDigitWrited) / 1000;
                if(STATS_UPDATING)updateStats(last_elapsed);
                const elapsed = (new Date() - roundStarted) / 1000;
                const wpm = 60 * totalDigits / 5 / elapsed;
                WPM_RESULT.innerText = (wpm.toFixed(0) + ' WPM\n');
                if (currentDigitIndex === DIGITS_IN_WORD - 1) {
                    startNewWord();
                    --currentDigitIndex;
                }
            }
            ++currentDigitIndex;
            lastDigitWrited = new Date();
        }
    }
}

function loadStats() {
    const savedDigitStats = localStorage.getItem('digitStats');
    return savedDigitStats ? JSON.parse(savedDigitStats) : {};
}

function saveStats(){
    localStorage.setItem('digitStats', JSON.stringify(digitStats));
}
function loadModel(){
    return [0.4, 0.3, 0.2, 0.1];
}

function predictTimes(digits, pos){
    var predictions = [];

    for (var nextDigit = 0; nextDigit < 10; ++ nextDigit){
        digits[pos] = nextDigit;
        var averages = [];
        for(let i = 0; i < MODEL_INPUTS; ++i){
            averages.push(null);
        }
        var s = "";
        var minx = Math.max(0, pos - MODEL_INPUTS + 1);
        for (let i = pos; i>= minx; --i){
            s = digits[i] + s;
            if (digitStats[s]) averages[pos-i] = digitStats[s];
        }
        var prediction = 0;
        var sumWeights = 0;
        for (let i=0; i<MODEL_INPUTS; ++i){
            if(averages[i]){
                prediction += modelWeights[i] * averages[i];
                sumWeights += modelWeights[i];
            }
        }
        if(sumWeights > 0){
            prediction /= sumWeights; 
        }
        else{
            prediction = Infinity;
        }
        
        predictions.push({digit: nextDigit, time: prediction});
    }

    predictions.sort((a, b) => a.time - b.time);

    return predictions;
}

function sortDictionaryByValues(dictionary) {
    const sortedEntries = Object.entries(dictionary).sort((a, b) => a[1] - b[1]);
    const sortedDictionary = Object.fromEntries(sortedEntries);
    return sortedDictionary;
  }

function generateDigitSequence() {
    var digits = new Array(DIGITS_IN_WORD);
    if(!SMART_GENERATING_MODE){
        for (let i = 0; i < DIGITS_IN_WORD; ++i) {
            var digit = Math.floor(Math.random() * 10);
            digits[i] = digit;
        }  
    }
    else{
        for(let i = 0; i < DIGITS_IN_WORD; ++i){
            var predictions = predictTimes(digits, i);
            var randomIndex = Math.floor(Math.sqrt(Math.floor(Math.random() * 100)))
            var digit = predictions[randomIndex].digit;
            digits[i] = digit;
        }
        // for(let i = 0; i < DIGITS_IN_WORD; ++i){
        //     digits[i] = 0;
        // }
    }

    return digits;
}

function startNewWord() {
    digitSequence = generateDigitSequence();
    SEQUENCE.innerText = digitSequence.join('');
    USER_INPUT.innerText = '';
    currentDigitIndex = 0;
    ++wordNumber;
}

function setTimer(seconds) {
    TIMER_DURATION_SECONDS = seconds;
    switch (seconds) {
        case 15:
            TIMER.innerText = '00:15';
            break;
        case 30:
            TIMER.innerText = '00:30';
            break;
        case 60:
            TIMER.innerText = '01:00';
            break;
        case 120:
            TIMER.innerText = '02:00';
            break;
    }
}

function startTimer() {
    let remainingSeconds = TIMER_DURATION_SECONDS;
    updateTimer(remainingSeconds);

    timerInterval = setInterval(function() {
        remainingSeconds--;
        if (remainingSeconds >= 0) {
            updateTimer(remainingSeconds);
        } else {
            stopTimer();
            wordNumber = 0;
            //alert('Czas minął!');
            saveStats();
            //document.location.reload();
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

function toggleGeneratingMode() {
    SMART_GENERATING_MODE = !SMART_GENERATING_MODE;
}

function toggleStatsUpdate() {
    STATS_UPDATING = !STATS_UPDATING;
}

window.addEventListener('keydown', writeAnswer);

document.addEventListener('DOMContentLoaded', () => {
    startNewWord();
});