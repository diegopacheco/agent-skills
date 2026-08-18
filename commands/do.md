# /do

Usage: `/do <prompt>`

The prompt is mandatory. If `$ARGUMENTS` is empty, stop and ask the user what to build. Do nothing else.

Task:

$ARGUMENTS

Build what I asked, but first read @design-doc. If there is no design doc, create one (it needs architecture, stack, pros/cons and decisions). Then add what I asked to backlog.md, which must have the sections `# Backlog`, `## TODO`, `## WIP` and `## DONE` — never work on an item without updating backlog.md first. Then implement it, make sure the system builds and all tests pass, and update readme.md, changelog.md and backlog.md. If this is a macOS/Electron app, use install.sh and the proper macOS scripts to refresh the app.

Report progress to the user as x/y every 20s, no matter what.
