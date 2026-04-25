import { test, expect } from "@playwright/test";

const WORKER_URL = "https://portfolio-agent.vegm92.workers.dev";

function mockWorker(page, reply = "Victor is available for contract work.") {
  return page.route(WORKER_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ reply }),
    })
  );
}

function mockWorkerError(page) {
  return page.route(WORKER_URL, (route) =>
    route.fulfill({ status: 500, body: "Internal Server Error" })
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// ─── Panel open / close ───────────────────────────────────────────────────────

test("FAB opens the agent panel", async ({ page }) => {
  await expect(page.locator("#agent")).not.toHaveClass(/open/);
  await page.click("#agent-fab");
  await expect(page.locator("#agent")).toHaveClass(/open/);
});

test("close button closes the panel", async ({ page }) => {
  await page.click("#agent-fab");
  await expect(page.locator("#agent")).toHaveClass(/open/);
  await page.click("#agent-close");
  await expect(page.locator("#agent")).not.toHaveClass(/open/);
});

test("FAB toggles closed when panel is open", async ({ page }) => {
  await page.click("#agent-fab");
  await page.click("#agent-fab");
  await expect(page.locator("#agent")).not.toHaveClass(/open/);
});

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

test("Ctrl+K opens the panel", async ({ page }) => {
  await page.keyboard.press("Control+k");
  await expect(page.locator("#agent")).toHaveClass(/open/);
});

test("Escape closes the panel", async ({ page }) => {
  await page.click("#agent-fab");
  await expect(page.locator("#agent")).toHaveClass(/open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#agent")).not.toHaveClass(/open/);
});

// ─── Sending messages ─────────────────────────────────────────────────────────

test("Enter key sends a message and shows bot reply", async ({ page }) => {
  await mockWorker(page, "Yes, Victor is available!");
  await page.click("#agent-fab");
  await page.fill("#agent-input", "Are you available?");
  await page.keyboard.press("Enter");

  await expect(page.locator("#agent-body .msg.user")).toHaveText("Are you available?");
  await expect(page.locator("#agent-body .msg.bot").last()).toHaveText(
    "Yes, Victor is available!",
    { timeout: 10000 }
  );
});

test("send button sends a message and shows bot reply", async ({ page }) => {
  await mockWorker(page, "TypeScript and Python are his main languages.");
  await page.click("#agent-fab");
  await page.fill("#agent-input", "What's his stack?");
  await page.click("#agent-send");

  await expect(page.locator("#agent-body .msg.user")).toHaveText("What's his stack?");
  await expect(page.locator("#agent-body .msg.bot").last()).toHaveText(
    "TypeScript and Python are his main languages.",
    { timeout: 10000 }
  );
});

test("input is cleared after sending", async ({ page }) => {
  await mockWorker(page);
  await page.click("#agent-fab");
  await page.fill("#agent-input", "Hello");
  await page.keyboard.press("Enter");
  await expect(page.locator("#agent-input")).toHaveValue("");
});

test("suggestion chips send a message", async ({ page }) => {
  await mockWorker(page, "He is available for hire.");
  await page.click("#agent-fab");
  await page.locator("#agent-suggest button").first().click();

  await expect(page.locator("#agent-body .msg.user")).not.toBeEmpty();
  await expect(page.locator("#agent-body .msg.bot").last()).toHaveText(
    "He is available for hire.",
    { timeout: 10000 }
  );
});

test("suggestion chips are hidden after first message", async ({ page }) => {
  await mockWorker(page);
  await page.click("#agent-fab");
  await page.fill("#agent-input", "Hi");
  await page.keyboard.press("Enter");

  await expect(page.locator("#agent-suggest")).toBeHidden({ timeout: 10000 });
});

// ─── Error fallback ───────────────────────────────────────────────────────────

test("shows error fallback when worker fails", async ({ page }) => {
  await mockWorkerError(page);
  await page.click("#agent-fab");
  await page.fill("#agent-input", "Hello");
  await page.keyboard.press("Enter");

  await expect(page.locator("#agent-body .msg.bot").last()).toContainText(
    "Something went wrong",
    { timeout: 10000 }
  );
});

// ─── Message limit ────────────────────────────────────────────────────────────

test("input locks after 10 messages", async ({ page }) => {
  await mockWorker(page, "reply");
  await page.click("#agent-fab");

  for (let i = 0; i < 10; i++) {
    await page.fill("#agent-input", `question ${i}`);
    await page.click("#agent-send");
    // wait for bot reply before sending next
    await expect(page.locator("#agent-body .msg.bot").nth(i)).toBeVisible({
      timeout: 10000,
    });
  }

  await expect(page.locator("#agent-input")).toBeDisabled();
  await expect(page.locator("#agent-send")).toBeDisabled();
});

test("limit message is shown after 10 messages", async ({ page }) => {
  await mockWorker(page, "reply");
  await page.click("#agent-fab");

  for (let i = 0; i < 10; i++) {
    await page.fill("#agent-input", `question ${i}`);
    await page.click("#agent-send");
    await expect(page.locator("#agent-body .msg.bot").nth(i)).toBeVisible({
      timeout: 10000,
    });
  }

  await expect(page.locator("#agent-body .msg.bot").last()).toContainText(
    "message limit"
  );
});
