---
name: playwright-skill
description: Rules for running Playwright and Chrome/Chromium on macOS without touching the user's own Chrome. Use when the user mentions Playwright, playwrite, browser automation, UI tests, screenshots, Chrome or Chromium automation, headless browser, or the Playwright MCP.
allowed-tools: [Bash, Read, AskUserQuestion]
---

## Always Hidden
* Always run the browser headless. `headless: true` in code, `--headless` for the Playwright MCP, never `--headed`.
* Never open a visible browser window unless the user explicitly asks to see it.
* Screenshots, videos, traces and PDFs work headless. Never go headed to take them.

## Never Touch The User Chrome
* Only use the browser Playwright installs: `npx playwright install chromium`. It lives in `~/Library/Caches/ms-playwright`.
* Never use `channel: 'chrome'`, `channel: 'msedge'`, `--browser chrome` or `executablePath` pointing at `/Applications/Google Chrome.app`.
* Never use the user profile `~/Library/Application Support/Google/Chrome` as `userDataDir`, not even a copy of it.
* When a persistent context is needed, use a fresh temp dir: `chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'pw-')), { headless: true })`.
* Never `connectOverCDP` to the user Chrome and never start the user Chrome with `--remote-debugging-port`.
* Never `pkill`, `killall` or `osascript quit` Google Chrome. Only close what was launched: `await browser.close()`.
* Never read or write the user Chrome cookies, history, bookmarks, passwords or extensions.

## When It Must Be Visible
* Headless is the only mode that keeps the browser out of the macOS Dock and the CMD + Tab switcher. A visible browser always shows in the Dock.
* Never edit the Info.plist or re-sign the Playwright Chromium app to hide it from the Dock, it stops launching.
* When the user wants to see what happened, stay headless and give them a video (`recordVideo`), a trace (`npx playwright show-trace`) or screenshots instead.
* Only go headed when the user explicitly asks for it after knowing it will show in the Dock, and close the browser as soon as the task is done.

## Dock Recent Apps
* A headed run, or an MCP that opens `/Applications/Google Chrome.app`, leaves a Chrome tile in the Dock recent apps area that the user must remove by hand.
* After any headed run, or when the user sees a Chrome tile in the Dock, run `~/.claude/skills/playwright-skill/dock-clean.sh`. It removes Chrome, Chrome for Testing and Chromium tiles from the Dock recent apps only, never the pinned apps, and restarts the Dock.

## Playwright MCP
* Configure it hidden and isolated: `npx @playwright/mcp@latest --headless --isolated --browser chromium`.
* A bare `npx @playwright/mcp@latest` opens the user Chrome with a visible window. When `claude mcp get playwright` shows args without `--headless --isolated --browser chromium`, fix it: `claude mcp remove playwright -s <scope>` then `claude mcp add playwright -s <scope> -- npx @playwright/mcp@latest --headless --isolated --browser chromium`.
* Always pass `--browser chromium`. It uses the Playwright Chrome for Testing, not `/Applications/Google Chrome.app`.
* Never `--browser chrome`, never `--user-data-dir` pointing at the user Chrome, never `--extension`.
* When the MCP says the browser is not installed, install Chromium for the Playwright version the MCP uses. Never switch to `--browser chrome` to work around it.
* The MCP blocks `data:` URLs, use a real `http` or `https` URL.

## Cleanup
* Always close every browser, context and page, also when the script fails: use `try / finally`.
* Delete the temp profile dirs that were created.
* Before finishing, check nothing is left: `pgrep -fl ms-playwright` must print nothing.
