let sets = [];
let editIndex = null;
const form = document.getElementById('exercise-form');
const setsList = document.getElementById('sets-list');
const historyList = document.getElementById('history-list');

document.getElementById('add-set').onclick = () => {
  const name = document.getElementById('exercise-name').value;
  const weight = document.getElementById('weight').value;
  const reps = document.getElementById('reps').value;

  if (name && weight && reps) {
    sets.push({ name, weight, reps });
    renderSets();
  }
};

form.onsubmit = (e) => {
  e.preventDefault();
  const date = new Date().toLocaleString();
  const workout = { date, sets: [...sets] };
  let history = JSON.parse(localStorage.getItem('history') || '[]');

  if (editIndex !== null) {
    workout.date = history[editIndex].date;
    history[editIndex] = workout;
    editIndex = null;
  } else {
    history.unshift(workout);
  }

  localStorage.setItem('history', JSON.stringify(history));
  sets = [];
  renderSets();
  renderHistory();
};

function renderSets() {
  setsList.innerHTML = sets.map((s, i) =>
    `<p>${s.name} - ${s.weight} lbs x ${s.reps} reps</p>`).join('');
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  historyList.innerHTML = history.map((entry, index) => `
    <li>
      <strong>${entry.date}</strong><br>
      ${entry.sets.map(s => `${s.name}: ${s.weight}x${s.reps}`).join('<br>')}<br>
      <button onclick="editWorkout(${index})">Edit</button>
      <button onclick="deleteWorkout(${index})">Delete</button>
    </li>`).join('');
}

function editWorkout(index) {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const workout = history[index];
  sets = [...workout.sets];
  renderSets();
  editIndex = index;
  window.scrollTo(0, 0);
}

function deleteWorkout(index) {
  let history = JSON.parse(localStorage.getItem('history') || '[]');
  history.splice(index, 1);
  localStorage.setItem('history', JSON.stringify(history));
  renderHistory();
}

renderHistory();

let timerInterval;
document.getElementById('start-timer').onclick = () => {
  const seconds = parseInt(document.getElementById('rest-seconds').value);
  let timeLeft = seconds;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
    }
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    document.getElementById('timer-display').textContent = `${mins}:${secs}`;
    timeLeft--;
  }, 1000);
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    console.log('Service Worker Registered');
  });
};
