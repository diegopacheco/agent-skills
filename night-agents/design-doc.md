# Design Doc

## Architecture Principles

* Agents are skills, plain markdown. Claude Code and Codex read the same `SKILL.md` files.
* One shared contract (`skills/night-agents/CONTRACT.md`) and one helper (`bin/night-run.sh`) give
  every agent the same run lifecycle: start, baseline, work, verify, document, finish.
* Agents never touch the user's working copy. Each run gets its own git worktree and branch.
* The file system is the database: every run is a folder under `~/.night-agents/runs/<date>/<project>/`.
* The UI is pregenerated. A generator turns the runs folder into a static site; the desktop app
  only wraps that site. No server, no port, no database.
* No runtime libraries. The generator, highlighter, markdown renderer and charts are plain JavaScript.

## Features

| Feature | Where |
|---|---|
| Eleven night agents as skills | `skills/<agent>/SKILL.md` |
| `/night-agents all`, `/night-agents <alias>`, `/night-agents` (asks) | `skills/night-agents/SKILL.md`, `commands/night-agents.md` |
| Install for Claude, Codex or both | `install.sh`, `uninstall.sh` |
| Run lifecycle, git stats, branch cleanup | `bin/night-run.sh` |
| `result.json` validation and UI generation | `bin/generate.js` |
| Activity grid, runs, branch browser, metrics, agents | `bin/site/*` |
| Agent logos | `ui/make-logos.js`, `bin/site/logos/` |
| macOS app with boot screen and shortcuts | `ui/*` |
| Sample repo with planted problems | `sample-project/`, `scripts/sample.sh` |

## Overall Diagram

![architecture](docs/architecture.svg)

## Run Layout

```
~/.night-agents/
  bin/                 night-run.sh, generate.js, agents.json, site/
  CONTRACT.md
  runs/<yyyy-mm-dd>/<project>/<agent>-<hhmmss>/
    run.json           written by night-run.sh start
    result.json        written by the agent, validated on finish
    git.json           written by night-run.sh finish
    branch.json        snapshot of the branch files and diffs, written by the generator
    report.md          the agent's report
    tests-before.log
    tests-after.log
  worktrees/<project>/ live worktrees of running agents
  ui/                  generated site: index.html, data.js, assets
```

Branches are named `night-agents/<agent>/<yyyy-mm-dd>-<hhmmss>`.

## TradeOffs

* Worktrees cost a dependency install per agent per night. In exchange the user's checkout is never
  touched and the agents can run in parallel.
* The site embeds every changed file and diff in `data.js`. Simple and fully searchable offline,
  but large histories make a large file. Files are capped at 300 KB each.
* Branch snapshots are cached in `branch.json`, so history survives merged and deleted branches,
  at the cost of disk space in the runs folder.
* Agent quality depends on the model following the skill. The helper enforces what can be enforced
  mechanically: a valid `result.json`, no regressions recorded as success, no uncommitted work
  left behind, no empty branches.

## Decisions

* Runs start from the last commit of the current branch, not from uncommitted changes.
* A run with no commits deletes its branch on finish. History stays in the runs folder.
* `result.json` with `status: success` must have a fixed finding. A run whose after tests have more
  failures than before must be `failed`. The generator marks broken results `invalid`.
* Git rules follow the git skill: merge only, never rebase, never push, commit messages prefixed
  with the project name, no `Co-Authored-By` lines.
* Agent colors are the validated categorical palette slots 1 to 8, in fixed order. The palette has eight
  slots, so `code-review-agent` (brown `#8c5a2b`), `test-review-agent` (teal `#0e7c86`) and
  `chief-of-staff-agent` (slate `#2f3b52`) use colors outside the validated set, always shown next to
  their logo, icon and name so color is never the only cue.
* `chief-of-staff-agent` reviews the other agents, so the dispatcher starts it only after every other
  selected run finished. It reads their run folders and branches, never checks them out, and re-runs
  their tests from `git archive` copies under its own run folder.
* Agent logos are PNGs rendered from `agents.json` (color, icon) by `ui/make-logos.js` into
  `bin/site/logos/`, so a new agent gets a logo by re-running the script.
* The branch viewer renders `.md` with the built in markdown renderer and `.html` in an iframe with
  `sandbox=""`, so a file on an agent branch can never run script in the app.
* `architect-agent` and `smith-sec-agent` are `reportOnly` in `agents.json`. They document findings
  and never change code: their findings must be `reported`, and `finish` refuses a branch that touches
  anything besides their `reportFile` and `.night-agents/`. A review that quietly rewrites code would
  ship changes nobody asked to review.
* The desktop app handles window drag and title bar double click itself, so the double click
  maximize and restore is explicit and restores the exact previous bounds.

## Sample Project

`sample-project/` is `brew-shop`, a Node.js + Express + SQLite API with problems planted for every agent.
`scripts/sample.sh` copies it to `~/night-agents-sample/brew-shop`, generates a 2.9 MB uncompressed
`public/hero.png`, makes it a git repo, installs dependencies and checks the tests pass.

| Agent | Planted problems |
|---|---|
| code-digger-agent | `src/legacy.js` never imported; `slugify`, `deepClone` unused; unused `path`, `crypto` imports and `DEBUG_PREFIX` in `src/utils.js`; `recalculateAllOrders` and its `verbose` parameter unused; `cacheHits` unused |
| presto-performance-agent | no index on `order_items.order_id`, `orders.customer_id`, `products.category`; N+1 items query in `listOrders`; `GET /api/products` returns every row; quadratic `topSellers`, `origins`, `searchProducts`; no cache on top sellers; uncompressed 2.9 MB hero image without size or lazy loading |
| migration-bot-agent | `express` pinned to 4.17.1; Express 5 removes `req.param()` and changes the `*` route syntax used in `src/server.js` |
| test-automator-agent | coupons, shipping, pagination, customers and orders have no tests; one happy path cart test |
| worm-doccer | README says Postgres, port 3000, `npm run dev`, `npm run test:unit`, a `FREESHIP` coupon, a search path and a DELETE endpoint that do not exist, and misses seven real endpoints; design-doc lists `src/inventory.js` and cents storage; performance.md claims indexes; backlog lists shipped features as TODO |
| bug-hunter | same coupon applied twice stacks; coupon expiry parsed as UTC midnight; free shipping uses `>` while the shop promises "$50 or more"; pagination is 0 based while callers send page 1; email uniqueness is case sensitive; money never rounded to cents; the server trusts prices sent by the client |
| architect-agent | `src/server.js` route `/api/customers/:id` runs SQL and formats money itself instead of going through `src/customers.js`; `src/admin.js` mixes auth and reporting; the admin token is hardcoded instead of configured; `design-doc.md` lists modules the code does not have |
| code-review-agent | README promises free shipping over $40 while `shipping` charges up to $50 (broken requirement); the same coupon counts twice in one cart (logical fallacy); `checkout` computes `shipping(net)` twice (bad code); inline SQL in a route (design); the only cart test asserts the subtotal and never the total (missing test) |
| test-review-agent | `test/cart.test.js` asserts only the subtotal and never the total, discount or shipping (weak); `test/server.test.js` health test only checks the framework answers (low value) |
| chief-of-staff-agent | the branches of the other agents: overlapping fixes of the same bugs by `bug-hunter` and `code-review-agent` conflict on `src/cart.js`, `src/orders.js` and `test/cart.test.js` |
| smith-sec-agent | SQL injection in `salesByOrigin` (`/api/admin/sales?origin=`); hardcoded admin token compared with `==` and sent in the query string; `/api/customers/:id` returns any customer's email with no auth (IDOR); no auth on order history; the server trusts client prices; `express` 4.17.1 has known advisories |

## How to Run

```bash
./install.sh both
./scripts/sample.sh
cd ~/night-agents-sample/brew-shop && claude "/night-agents all"
./ui/install.sh
./scripts/start-all.sh
```

## How to Test

```bash
./scripts/test-all.sh
```

## All REST Endpoints

None. The UI is a static site and the app talks to the generator through Electron IPC only:
`refresh`, `toggle-maximize`, `drag-start`, `drag-end`.
