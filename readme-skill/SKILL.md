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