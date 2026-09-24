'use strict';

const fs = require('fs/promises');
const path = require('path');

// 파일 입출력은 main 프로세스 전용. 안전한 쓰기(tmp -> rename), 깨진 JSON 보존 후 초기화.

async function loadTasks(filePath) {
  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await saveTasks(filePath, []);
      return { tasks: [], broken: false };
    }
    throw err;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    return { tasks: parsed, broken: false };
  } catch (err) {
    const dir = path.dirname(filePath);
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-');
    const brokenPath = path.join(dir, `tasks.broken-${stamp}.json`);
    await fs.rename(filePath, brokenPath);
    await saveTasks(filePath, []);
    return { tasks: [], broken: true, brokenPath };
  }
}

async function saveTasks(filePath, tasks) {
  const tmpPath = `${filePath}.tmp`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(tmpPath, JSON.stringify(tasks, null, 2), 'utf8');
  await fs.rename(tmpPath, filePath);
}

module.exports = { loadTasks, saveTasks };
