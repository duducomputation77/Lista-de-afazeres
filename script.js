// Seleção dos elementos do DOM
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const filterButtons = document.querySelectorAll('.filter-btn');

const LOCAL_STORAGE_KEY = 'todo_list_github_tasks';

// Estado da aplicação
let tasks = [];
let currentFilter = 'all';

// Eventos
document.addEventListener('DOMContentLoaded', init);

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Remove a borda de erro assim que o usuário volta a digitar
taskInput.addEventListener('input', () => {
  taskInput.classList.remove('error');
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Inicialização
function init() {
  tasks = getTasksFromStorage();
  renderTasks();
}

// Persistência
function getTasksFromStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

    // Garante que tarefas salvas na versão antiga (sem id) continuem funcionando
    return stored.map((task, index) => ({
      id: task.id ?? Date.now() + index,
      text: task.text,
      completed: Boolean(task.completed),
    }));
  } catch (error) {
    return [];
  }
}

function saveTasksToStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}

// Filtros
function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  renderTasks();
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'pending':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function getEmptyMessage() {
  switch (currentFilter) {
    case 'pending':
      return 'Nenhuma tarefa pendente.';
    case 'completed':
      return 'Nenhuma tarefa concluída.';
    default:
      return 'Nenhuma tarefa cadastrada.';
  }
}

// Ações
function addTask() {
  const taskText = taskInput.value.trim();
  taskInput.classList.remove('error');

  // Validação 1: Campo vazio
  if (!taskText) {
    taskInput.classList.add('error');
    alert('Digite algo para inserir em sua lista!');
    return;
  }

  // Validação 2: Descrição duplicada
  const taskExists = tasks.some(
    (task) => task.text.toLowerCase() === taskText.toLowerCase()
  );

  if (taskExists) {
    alert('Já existe uma tarefa com essa descrição!');
    return;
  }

  tasks.push({ id: Date.now(), text: taskText, completed: false });
  saveTasksToStorage();
  renderTasks();

  taskInput.value = '';
  taskInput.focus();
}

function toggleTaskComplete(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasksToStorage();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasksToStorage();
  renderTasks();
}

// Renderização
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = getFilteredTasks();
  filteredTasks.forEach(renderTaskElement);

  emptyMessage.textContent = filteredTasks.length ? '' : getEmptyMessage();
}

function renderTaskElement(task) {
  const li = document.createElement('li');

  if (task.completed) {
    li.classList.add('completed');
  }

  const span = document.createElement('span');
  span.textContent = task.text;
  span.addEventListener('click', () => toggleTaskComplete(task.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'X';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}
