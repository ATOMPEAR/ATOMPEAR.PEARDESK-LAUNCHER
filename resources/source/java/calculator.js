'use strict';

function initializeCalculator() {
    const previousOperandElement = document.getElementById('previousOperand');
    const currentOperandElement = document.getElementById('currentOperand');
    const historyList = document.getElementById('calculatorHistory');
    const expandButton = document.getElementById('expandHistory');
    const historyItems = document.querySelector('.history-items');
    let isExpanded = false;
    
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let shouldResetScreen = false;

    function updateDisplay() {
        currentOperandElement.textContent = currentOperand;
        previousOperandElement.textContent = previousOperand;
    }

    function addToHistory(calculation, result) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="history-calculation">${calculation}</span>
            <span class="history-result">${result}</span>
        `;
        historyItems.appendChild(historyItem);
        historyItems.scrollTop = historyItems.scrollHeight;
        updateHistoryState(); // Update state when adding item
    }

    function appendNumber(number) {
        if (shouldResetScreen) {
            currentOperand = '';
            shouldResetScreen = false;
        }
        if (number === '.' && currentOperand.includes('.')) return;
        currentOperand = currentOperand === '0' ? number : currentOperand + number;
        updateDisplay();
    }

    function toggleSign() {
        if (currentOperand === '0') return;
        currentOperand = currentOperand.startsWith('-') ? 
            currentOperand.slice(1) : 
            '-' + currentOperand;
        updateDisplay();
    }

    function handleOperation(op) {
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            calculate();
        }
        operation = op;
        previousOperand = `${currentOperand} ${op}`;
        currentOperand = '';
        updateDisplay();
    }

    function calculate() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            case '%':
                computation = prev * (current / 100);
                break;
            default:
                return;
        }

        const calculation = `${prev} ${operation} ${current}`;
        currentOperand = computation.toString();
        addToHistory(calculation, currentOperand);
        operation = undefined;
        previousOperand = '';
        shouldResetScreen = true;
        updateDisplay();
    }

    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        updateDisplay();
    }

    function handleSquareRoot() {
        if (currentOperand === '') return;
        const number = parseFloat(currentOperand);
        if (number < 0) {
            currentOperand = 'Error';
        } else {
            const calculation = `√(${currentOperand})`;
            currentOperand = Math.sqrt(number).toString();
            addToHistory(calculation, currentOperand);
        }
        shouldResetScreen = true;
        updateDisplay();
    }

    // Event listeners for calculator buttons
    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('number')) {
                appendNumber(button.textContent);
            } else {
                const action = button.dataset.action;
                switch (action) {
                    case 'add':
                        handleOperation('+');
                        break;
                    case 'subtract':
                        handleOperation('−');
                        break;
                    case 'multiply':
                        handleOperation('×');
                        break;
                    case 'divide':
                        handleOperation('÷');
                        break;
                    case 'percent':
                        handleOperation('%');
                        break;
                    case 'equals':
                        if (operation) calculate();
                        break;
                    case 'clear':
                        clear();
                        break;
                    case 'sqrt':
                        handleSquareRoot();
                        break;
                    case 'negate':
                        toggleSign();
                        break;
                }
            }
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            appendNumber(e.key);
        } else if (e.key === '+') {
            handleOperation('+');
        } else if (e.key === '-') {
            handleOperation('−');
        } else if (e.key === '*') {
            handleOperation('×');
        } else if (e.key === '/') {
            e.preventDefault();
            handleOperation('÷');
        } else if (e.key === 'Enter' || e.key === '=') {
            if (operation) calculate();
        } else if (e.key === 'Escape') {
            clear();
        } else if (e.key === 'Backspace') {
            currentOperand = currentOperand.slice(0, -1) || '0';
            updateDisplay();
        }
    });

    // Function to check if history is empty
    function isHistoryEmpty() {
        return historyItems.children.length === 0;
    }

    // Function to update history state
    function updateHistoryState() {
        if (isHistoryEmpty()) {
            // Collapse if empty
            isExpanded = false;
            historyList.classList.add('collapsed');
            expandButton.querySelector('i').style.transform = 'rotate(0deg)';
            historyList.style.maxHeight = '0';
        } else {
            // Expand if has items
            isExpanded = true;
            historyList.classList.remove('collapsed');
            expandButton.querySelector('i').style.transform = 'rotate(180deg)';
            historyList.style.maxHeight = '74px';
        }
    }

    // Update clear history functionality
    const clearHistoryButton = document.getElementById('clearHistory');
    clearHistoryButton.addEventListener('click', () => {
        historyItems.innerHTML = '';
        updateHistoryState(); // Update state when clearing
    });

    // Manual expand/collapse still available
    expandButton.addEventListener('click', () => {
        if (!isHistoryEmpty()) { // Only allow toggle if history exists
            isExpanded = !isExpanded;
            historyList.classList.toggle('collapsed');
            expandButton.querySelector('i').style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
            historyList.style.maxHeight = isExpanded ? '74px' : '0';
        }
    });

    // Initial state
    historyList.classList.add('collapsed');
    historyList.style.maxHeight = '0';
    updateHistoryState();
}

module.exports = { initializeCalculator };
