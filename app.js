let sets = [];
let editIndex = null;
const form = document.getElementById('exercise-form');
const setsList = document.getElementById('sets-list');
const historyList = document.getElementById('history-list');
const templateNameInput = document.getElementById('template-name');
const workoutTemplatesSelect = document.getElementById('workout-templates');

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

function renderTemplateList() {
    const names = listSavedWorkoutNames();
    workoutTemplatesSelect.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
}

document.getElementById('save-template').addEventListener('click', () => {
    const name = templateNameInput.value.trim();
    if (name && sets.length > 0) {
        saveWorkoutWithName(name, sets);
        templateNameInput.value = '';
        renderTemplateList();
    } else {
        alert('Please enter a template name and add at least one exercise.');
    }
});

document.getElementById('load-template').addEventListener('click', () => {
    const name = workoutTemplatesSelect.value;
    if (name) {
        const loadedSets = loadWorkoutByName(name);
        if(loadedSets) {
            sets = loadedSets;
            renderSets();
        }
    }
});

function deleteWorkoutByName(name) {
    const workouts = JSON.parse(localStorage.getItem('namedWorkouts') || '{}');
    delete workouts[name];
    localStorage.setItem('namedWorkouts', JSON.stringify(workouts));
}

document.getElementById('delete-template').addEventListener('click', () => {
    const name = workoutTemplatesSelect.value;
    if (name && confirm(`Are you sure you want to delete the "${name}" template?`)) {
        deleteWorkoutByName(name);
        renderTemplateList();
    }
});

renderHistory();
renderTemplateList();

let timerInterval;
document.getElementById('start-timer').onclick = () => {
  const seconds = parseInt(document.getElementById('rest-seconds').value);
  let timeLeft = seconds;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      playDing();
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


// Play ding sound when timer ends
function playDing() {
    const ding = document.getElementById('ding');
    if (ding) ding.play();
}

// Add workout name functionality
function saveWorkoutWithName(name, exercises) {
    const workouts = JSON.parse(localStorage.getItem('namedWorkouts') || '{}');
    workouts[name] = exercises;
    localStorage.setItem('namedWorkouts', JSON.stringify(workouts));
}

function loadWorkoutByName(name) {
    const workouts = JSON.parse(localStorage.getItem('namedWorkouts') || '{}');
    return workouts[name] || [];
}

function listSavedWorkoutNames() {
    const workouts = JSON.parse(localStorage.getItem('namedWorkouts') || '{}');
    return Object.keys(workouts);
}

// Example integration - call playDing() when timer ends, and prompt for naming
// You must hook these into your existing UI accordingly.
