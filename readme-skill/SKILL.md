---
name: readme-skill
description: When need to create README.md for a project, use this skill to create a README.md file. IF user mentiond README.md, use this skill.
allowed-tools: [Bash, Read, AskUserQuestion]
---

## README.md
* Never do ACII ART for architecture diagrams
* Always do Excalidraw-style diagram. Rendered a hand-drawn flow diagram (wobble filter + "Caveat" handwriting font, pastel boxes, solid capture path). Makle sure nothing overlaps.
* When there is UI always use Playwright MCP to take print screens, add on printscreens/ folder on the project and always load, refer, render the images and explain on README.md
* IF there is a logo, always display/render in the begining of the README 
* README of solutions must have: 
  - Logo (display/render in the begining of the README)
  - What the project is/dos after the logo.
  - How it Works? (3-15 lines max)
  - Architecture 
  - Features (list of features with 1-2 lines MAX explaining why)
  - Stack (list list with 1 line explaining why)
  - Contracts/APIs (Swagger if apply other wise simple REST API description)
  - key datastructures and software design decision if any 
  - How to run the app/tests
  - Printscreens of the UI (all tabs), render/display the printscreens on README.md and explain what is happening on each printscreen.

## Privacy
* Never leak information from the local machine into README.md.
* Never write absolute paths, home directories (/Users/<name>, /home/<name>, ~), machine names, usernames, IPs, ports bound to the local network, emails, tokens, keys or env values.
* Only use paths relative to the root of the current GitHub repo.
* Never reference files, folders or projects outside the current repo.
* Printscreens and images are a leak risk by default: capture only the app window/viewport, never the full screen.
* Printscreens must not show anything outside the app window: no desktop, no dock, no menu bar, no notifications, no other windows or tabs, no browser bookmarks, no address bar with local paths, no personal data.
* Printscreens must never show local paths, terminals, shells, IDEs, file explorers, or processes/services running on the machine outside the current git repo.
* Crop or retake any printscreen that captured something outside the repo app, and delete the original file.
* Strip image metadata (EXIF, author, device, location) before committing printscreens.
* Scrub command outputs and logs pasted into the README of any local path or personal information.
* The only exception is when the user explicitly asks and acknowledges the leak.
