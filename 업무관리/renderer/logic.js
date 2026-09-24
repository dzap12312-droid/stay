'use strict';

// 순수 함수 모음: 정렬, 필터, 날짜, id 생성. main/renderer 양쪽에서 재사용 + node --test로 단위 테스트.

function todayLocalDateString(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateUniqueId(existingIds) {
  let id = Date.now();
  const idSet = existingIds instanceof Set ? existingIds : new Set(existingIds);
  while (idSet.has(id)) {
    id += 1;
  }
  return id;
}

// 정렬: 1) 미완료 먼저 2) 날짜 오름차순 3) id 오름차순
function compareTasks(a, b) {
  if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
  }
  if (a.date !== b.date) {
    return a.date < b.date ? -1 : 1;
  }
  return a.id - b.id;
}

function sortTasks(tasks) {
  return [...tasks].sort(compareTasks);
}

// status: 'all' | 'incomplete' | 'completed'
function filterTasks(tasks, { status = 'all', assignee = 'all' } = {}) {
  return tasks.filter((t) => {
    if (status === 'incomplete' && t.completed) return false;
    if (status === 'completed' && !t.completed) return false;
    if (assignee !== 'all' && t.assignee !== assignee) return false;
    return true;
  });
}

function getAssigneeList(tasks) {
  const set = new Set(tasks.map((t) => t.assignee));
  return [...set].sort((a, b) => a.localeCompare(b, 'ko'));
}

const Logic = {
  todayLocalDateString,
  generateUniqueId,
  compareTasks,
  sortTasks,
  filterTasks,
  getAssigneeList,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logic;
} else {
  window.Logic = Logic;
}
