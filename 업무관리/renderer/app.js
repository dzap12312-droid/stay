'use strict';

(function () {
  const { todayLocalDateString, generateUniqueId, sortTasks, filterTasks, getAssigneeList } = window.Logic;

  const form = document.getElementById('add-form');
  const assigneeInput = document.getElementById('assignee-input');
  const taskInput = document.getElementById('task-input');
  const dateInput = document.getElementById('date-input');
  const assigneeList = document.getElementById('assignee-list');
  const statusFilterEl = document.getElementById('status-filter');
  const assigneeFilterEl = document.getElementById('assignee-filter');
  const tableBody = document.getElementById('task-body');
  const emptyMessage = document.getElementById('empty-message');
  const table = document.getElementById('task-table');

  let tasks = [];
  let statusFilter = 'all';
  let assigneeFilter = 'all';

  function clearInvalid(el) {
    el.classList.remove('invalid');
  }

  function markInvalid(el) {
    el.classList.add('invalid');
    el.focus();
  }

  async function persist() {
    await window.api.saveTasks(tasks);
  }

  function renderAssigneeDatalist() {
    const names = getAssigneeList(tasks);
    assigneeList.innerHTML = '';
    for (const name of names) {
      const opt = document.createElement('option');
      opt.value = name;
      assigneeList.appendChild(opt);
    }
  }

  function renderAssigneeFilterButtons() {
    const names = getAssigneeList(tasks);

    if (assigneeFilter !== 'all' && !names.includes(assigneeFilter)) {
      assigneeFilter = 'all';
    }

    assigneeFilterEl.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.dataset.assignee = 'all';
    allBtn.textContent = '전체';
    if (assigneeFilter === 'all') allBtn.classList.add('active');
    assigneeFilterEl.appendChild(allBtn);

    for (const name of names) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.assignee = name;
      btn.textContent = name;
      if (assigneeFilter === name) btn.classList.add('active');
      assigneeFilterEl.appendChild(btn);
    }
  }

  function renderTable() {
    const filtered = filterTasks(sortTasks(tasks), { status: statusFilter, assignee: assigneeFilter });

    tableBody.innerHTML = '';

    if (tasks.length === 0) {
      emptyMessage.textContent = '등록된 업무가 없습니다';
      emptyMessage.hidden = false;
      table.hidden = true;
      return;
    }

    if (filtered.length === 0) {
      emptyMessage.textContent = '조건에 맞는 업무가 없습니다';
      emptyMessage.hidden = false;
      table.hidden = true;
      return;
    }

    emptyMessage.hidden = true;
    table.hidden = false;

    for (const t of filtered) {
      const tr = document.createElement('tr');
      tr.className = 'task-row' + (t.completed ? ' completed' : '');
      tr.dataset.id = String(t.id);

      const checkTd = document.createElement('td');
      checkTd.className = 'col-check';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = t.completed;
      checkbox.addEventListener('change', () => toggleCompleted(t.id));
      checkTd.appendChild(checkbox);

      const assigneeTd = document.createElement('td');
      assigneeTd.className = 'col-assignee';
      assigneeTd.textContent = t.assignee;

      const taskTd = document.createElement('td');
      taskTd.className = 'col-task';
      taskTd.textContent = t.task;

      const dateTd = document.createElement('td');
      dateTd.className = 'col-date';
      dateTd.textContent = t.date;

      const deleteTd = document.createElement('td');
      deleteTd.className = 'col-delete';
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', () => deleteTask(t.id));
      deleteTd.appendChild(deleteBtn);

      tr.appendChild(checkTd);
      tr.appendChild(assigneeTd);
      tr.appendChild(taskTd);
      tr.appendChild(dateTd);
      tr.appendChild(deleteTd);
      tableBody.appendChild(tr);
    }
  }

  function renderAll() {
    renderAssigneeDatalist();
    renderAssigneeFilterButtons();
    renderTable();
  }

  async function toggleCompleted(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t.completed = !t.completed;
    await persist();
    renderTable();
  }

  async function deleteTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const ok = window.confirm(`이 업무를 삭제할까요?\n${t.task}`);
    if (!ok) return;
    tasks = tasks.filter((x) => x.id !== id);
    await persist();
    renderAll();
  }

  async function addTask(assignee, task, date) {
    const id = generateUniqueId(tasks.map((t) => t.id));
    tasks.push({ id, assignee, task, date, completed: false });
    await persist();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const assignee = assigneeInput.value.trim();
    const task = taskInput.value.trim();
    const date = dateInput.value || todayLocalDateString();

    clearInvalid(assigneeInput);
    clearInvalid(taskInput);

    if (!assignee) {
      markInvalid(assigneeInput);
      return;
    }
    if (!task) {
      markInvalid(taskInput);
      return;
    }

    await addTask(assignee, task, date);

    taskInput.value = '';
    taskInput.focus();
    renderAll();
  });

  statusFilterEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-status]');
    if (!btn) return;
    statusFilter = btn.dataset.status;
    for (const b of statusFilterEl.querySelectorAll('button')) {
      b.classList.toggle('active', b === btn);
    }
    renderTable();
  });

  assigneeFilterEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-assignee]');
    if (!btn) return;
    assigneeFilter = btn.dataset.assignee;
    renderAssigneeFilterButtons();
    renderTable();
  });

  async function init() {
    dateInput.value = todayLocalDateString();
    tasks = await window.api.loadTasks();
    renderAll();
    assigneeInput.focus();
  }

  init();
})();
