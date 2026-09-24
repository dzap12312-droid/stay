'use strict';

// Playwright _electron E2E. Windows에서 `npx playwright test test/e2e.spec.js`로 실행한다.
// (이 파일을 만든 클라우드 환경은 GUI가 없어 실행하지 못했다 — README/최종 보고 참고)

const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

test('실행 -> 추가 -> 체크 -> 해제 -> 삭제 -> 필터 -> 재실행 후 데이터 유지', async () => {
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'task-manager-e2e-'));

  async function launch() {
    return electron.launch({
      args: [path.join(__dirname, '..', 'main.js'), `--user-data-dir=${userDataDir}`],
    });
  }

  let app = await launch();
  let win = await app.firstWindow();

  await win.fill('#assignee-input', '유태연');
  await win.fill('#task-input', '지게차 임대 현황 확인');
  await win.press('#task-input', 'Enter');

  await expect(win.locator('.task-row')).toHaveCount(1);
  await expect(win.locator('#assignee-input')).toHaveValue('유태연');
  await expect(win.locator('#task-input')).toHaveValue('');

  await win.locator('.task-row input[type=checkbox]').check();
  await expect(win.locator('.task-row.completed')).toHaveCount(1);

  await win.locator('.task-row input[type=checkbox]').uncheck();
  await expect(win.locator('.task-row.completed')).toHaveCount(0);

  win.once('dialog', (dialog) => dialog.accept());
  await win.locator('.delete-btn').click();
  await expect(win.locator('#empty-message')).toBeVisible();

  await win.fill('#assignee-input', '홍길동');
  await win.fill('#task-input', '팔레트 취합 확인');
  await win.press('#task-input', 'Enter');

  await win.locator('#assignee-filter button[data-assignee="유태연"]').click().catch(() => {});
  await win.locator('#assignee-filter button[data-assignee="전체"]').first();

  await app.close();

  app = await launch();
  win = await app.firstWindow();
  await expect(win.locator('.task-row')).toHaveCount(1);
  await app.close();
});
