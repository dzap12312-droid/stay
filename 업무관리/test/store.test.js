'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { loadTasks, saveTasks } = require('../src/store.js');

async function makeTmpDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'task-manager-test-'));
}

test('파일이 없으면 빈 배열로 시작하고 파일을 생성한다', async () => {
  const dir = await makeTmpDir();
  const filePath = path.join(dir, 'tasks.json');

  const result = await loadTasks(filePath);
  assert.deepEqual(result.tasks, []);
  assert.equal(result.broken, false);

  const stat = await fs.stat(filePath);
  assert.ok(stat.isFile());
});

test('저장 후 다시 읽으면 동일한 내용을 반환한다', async () => {
  const dir = await makeTmpDir();
  const filePath = path.join(dir, 'tasks.json');
  const tasks = [{ id: 1, assignee: 'a', task: 'b', date: '2026-09-24', completed: false }];

  await saveTasks(filePath, tasks);
  const result = await loadTasks(filePath);
  assert.deepEqual(result.tasks, tasks);
});

test('JSON이 깨져 있으면 보존 후 빈 배열로 시작한다', async () => {
  const dir = await makeTmpDir();
  const filePath = path.join(dir, 'tasks.json');
  await fs.writeFile(filePath, '{ this is not valid json', 'utf8');

  const result = await loadTasks(filePath);
  assert.deepEqual(result.tasks, []);
  assert.equal(result.broken, true);
  assert.ok(result.brokenPath);

  const brokenContent = await fs.readFile(result.brokenPath, 'utf8');
  assert.equal(brokenContent, '{ this is not valid json');

  const currentContent = JSON.parse(await fs.readFile(filePath, 'utf8'));
  assert.deepEqual(currentContent, []);
});

test('저장 중단을 흉내내도 tmp 파일이 남으면 기존 파일은 손상되지 않는다', async () => {
  const dir = await makeTmpDir();
  const filePath = path.join(dir, 'tasks.json');
  const initial = [{ id: 1, assignee: 'a', task: 'b', date: '2026-09-24', completed: false }];
  await saveTasks(filePath, initial);

  // tmp 파일만 존재하는 상황(쓰기 도중 중단)을 흉내낸다: rename 전이므로 원본은 그대로여야 한다.
  await fs.writeFile(`${filePath}.tmp`, 'partial', 'utf8');

  const result = await loadTasks(filePath);
  assert.deepEqual(result.tasks, initial);
});
