const calcList = document.getElementById('calcList');
const clearBtn = document.getElementById('clearBtn');
const MAX_ITEMS = 20;

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  clearBtn.addEventListener('click', clearHistory);
});

function doCalculate() {
  const input = document.getElementById('expression');
  const expr = input.value.trim();
  if (!expr) return;

  const result = calculate(expr);
  saveHistory(expr, result);
}

function calculate(expr) {
  try {
    if (/^[0-9+\-*/().%\s]+$/.test(expr)) {
      const result = eval(expr);
      return parseFloat(result.toFixed(10)).toString();
    }
    throw new Error('Invalid expression');
  } catch (e) {
    return 'Error';
  }
}

function saveHistory(expression, result) {
  let history = getHistory();
  history.list.unshift({ expression, result });
  if (history.list.length > MAX_ITEMS) {
    history.list = history.list.slice(0, MAX_ITEMS);
  }
  setHistory(history);
  loadHistory();
}

function loadHistory() {
  const history = getHistory();
  let html = `
    <div class="calc-item input-line">
      <input type="text" id="expression" placeholder="Input expression, press Enter" autofocus>
    </div>
  `;

  history.list.forEach((item, index) => {
    html += `
      <div class="calc-item">
        <span class="content">${item.expression}  <span class="result">= ${item.result}</span></span>
        <button class="delete-btn" onclick="deleteHistory(${index})">Delete</button>
      </div>
    `;
  });

  calcList.innerHTML = html;
  clearBtn.classList.toggle('hidden', history.list.length === 0);

  const newInput = document.getElementById('expression');
  newInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doCalculate();
  });
  newInput.focus();
  calcList.scrollTop = 0;
}

function deleteHistory(index) {
  const history = getHistory();
  history.list.splice(index, 1);
  setHistory(history);
  loadHistory();
}

function clearHistory() {
  if (typeof utools !== 'undefined') {
    utools.db.remove('calc_history');
  } else {
    localStorage.removeItem('calc_history');
  }
  loadHistory();
}

function getHistory() {
  if (typeof utools !== 'undefined') {
    return utools.db.get('calc_history') || { list: [] };
  }
  const data = localStorage.getItem('calc_history');
  return data ? JSON.parse(data) : { list: [] };
}

function setHistory(history) {
  if (typeof utools !== 'undefined') {
    utools.db.put({ _id: 'calc_history', _rev: history._rev, list: history.list });
  } else {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }
}
