---
name: macos-electron-apps
description: When need to create a macos or electron app, use this skill to create a macos electron app. IF user mentiond macos / electron, use this skill.
allowed-tools: [Bash, Read, AskUserQuestion]
---

## Electron/Swift MacOS Apps
- Application is always light themed, never dark themed unless user explicitly asked for it.
- Macos apps must have a proper logo, usually the same logo of the app, if app don't have it, create it. Logo must be rounded and not with sharp edges.
- Make sure there are install/uninstall scripts
- Always make sure it's just one version and one version only of the app installed. This must be guarateed by install/uninstall scripts.
- When making changes make sure remove, rebuild, re-install the app via the install/uninstall scripts. Do not just overwrite the app.
- Macos/electron apps only have one UI instance no matter what, do not allow 2 instances of the same app. also dont allow 2 versions of same app be installed, it's only one version of the app installed at any time.
- Macos/electron apps are drag-able and user can resize and muve them around easily.
- Macos/electron apps allow copy and paste with CMD + c and CMD + v, and also allow cut with CMD + x.
- Macos/electron apps remeber the position x,y or full screen when open/close and restore exact position of app in ui/screen.
- Macos/Electron apps must have common shortcut features like(unless app only lives in top menu bar - for this case you can ignore this):
  - CMD + k: search anything on the app, in a nice modal - enter goto. This modal must:
    - List the app menu tabs as entries, so any tab can be reached from CMD + k.
    - Always show an icon next to every entry, no entry without an icon. Tab entries use the same icon of the tab they go to. Draw the icons as inline SVG at a single stroke weight, no icon font or icon library.
  - CMD + /: display all shortcuts in a modal like cmd + k. This modal must:
    - Always fit on the screen: cap the card height (max-height ~92vh), flow the groups in columns, and scroll inside the card so no shortcut is ever cut off. Drop to a single column on narrow windows.
    - Group the shortcuts by feature area, each group with its own icon and its own color(icon, group title, border and the keys of that group share the color). Draw the icons as inline SVG at a single stroke weight, do not add an icon font or an icon library.
    - Have a search bar on top, auto focused, filtering as the user types. Matching a group title keeps the whole group, otherwise keep only the rows matching the keys or the description. Show how many shortcuts matched, and a plain message when nothing does. Esc clears a filled search box first, and closes the modal when it is empty.
  - CMD + + and CMD + -: Zoom in and out of the app.
  - CMD + 0..9 Goto tabs of the app.
- Tabs always have an icon next to the tab title. Draw the icons as inline SVG at a single stroke weight, no icon font or icon library. The CMD + / modal shows each tab shortcut (CMD + 0..9) with the same icon of the tab it goes to.
- When the mouse hovers over an element of the app that has a shortcut (tabs, buttons, menu items, toolbar actions), show a small tooltip with the action name and its shortcut keys, i.e "Search  ⌘ K". Show it after a short delay (~400ms), hide it on mouse leave, keep it inside the window, and keep the keys in sync with the real shortcut map so the tooltip and the CMD + / modal never disagree.
  - CMD + p: print screen capture like CMD + SHIFT + 4 in macos.
  - CMD + shift + enter: Full screen mode. Again, go back to normal.
- Double click on the top/title bar makes the app use all the space of the monitor, double click again restores the previous size and position. Do not rely on the macos zoom default, handle the double click on the draggable strip and toggle maximize/unmaximize explicitly, keeping the restored bounds so the app goes back exactly where it was.
- When macos/electron apps start they start all needed services ideally there is alredy a scripts/start-all.sh
- When macos/electron apps start they show a ui with all services booting i.e nodejs ready, api ready, postgres loading... 
- When macos/electron apps stop/quit they stop all needed services ideally there is alredy a scripts/stop-all.sh
- The same solution must work well as a web app, as a mobile app and as the macos/electron experience. The same UI is rendered on an iPhone 18 MP, so it must be responsive: no horizontal scroll, touch targets of at least 44px, safe-area insets respected, and every feature reachable by touch, not only by shortcut or hover. Verify all three: macos/electron window, desktop browser and the iPhone 18 MP viewport.
- Every panel, modal and widget, in every UI, has two buttons on its top right corner, drawn as inline SVG at a single stroke weight:
  - Expand/collapse: an icon with two diagonal arrows (one up-right, one down-left). Click expands the panel to almost full screen (leave a small margin around it), click again collapses it back to its normal size and position. The icon switches to two arrows pointing inward while expanded.
  - Hide/restore: an icon to hide the panel, and a way to bring it back to normal (i.e a small restore chip or the same button), so a hidden panel is never lost.
  - Both buttons must work the same on macos/electron, web and mobile: real click and tap, touch targets of at least 44px on mobile, Esc collapses an expanded panel, and each button shows a tooltip with its action name.