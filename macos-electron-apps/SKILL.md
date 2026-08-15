---
name: macos-electron-apps
description: When need to create a macos or electron app, use this skill to create a macos electron app. IF user mentiond macos / electron, use this skill.
allowed-tools: [Bash, Read, AskUserQuestion]
---

## Electron/Swift MacOS Apps
- Application is always light themed, never dark themed unless user explicitly asked for it.
- Macos apps must have a proper logo, usually the same logo of the app, if app don't have it, create it.
- Make sure there are install/uninstall scripts
- Always make sure it's just one version and one version only of the app installed. This must be guarateed by install/uninstall scripts.
- When making changes make sure remove, rebuild, re-install the app via the install/uninstall scripts. Do not just overwrite the app.
- Macos/Electron apps must have common shortcut features like(unless app only lives in top menu bar - for this case you can ignore this):
  - CMD + k: search anything on the app, in a nice modal - enter goto.
  - CMD + /: display all shortcuts in a modal like cmd + k.
  - CMD + + and CMD + -: Zoom in and out of the app.
  - CMD + 0..9 Goto tabs of the app.
  - CMD + p: print screen capture like CMD + SHIFT + 4 in macos.
  - CMD + enter: Full screen mode. Again, go back to normal.