---
name: ops-router
description: Route a production operations request to the right runbook - deploy a service, roll back a release, investigate an incident or outage, read service logs, or scale capacity. Use when the user talks about shipping, releasing, rolling out, reverting, something being down or slow, errors in production, logs, or adding capacity. Do not use for writing application code or local builds.
---

# Ops Router

This skill routes by meaning, not by keyword. Read the request, decide the intent, then load only the one route file that matches.

## Routes

| Intent | Typical words, synonyms included | Route |
|---|---|---|
| Deploy | ship, release, roll out, push to prod, promote, go live | `routes/deploy.md` |
| Rollback | revert, undo the release, go back, previous version, bad deploy | `routes/rollback.md` |
| Incident | down, outage, 5xx, slow, latency, paging, customers complaining | `routes/incident.md` |
| Logs | logs, stack trace, what happened at, grep production, tail | `routes/logs.md` |
| Scale | more pods, capacity, autoscale, traffic spike, out of memory | `routes/scale.md` |

## How to route

1. Restate the request as one intent in your own words.
2. Score every route: strong match, weak match or no match.
3. Exactly one strong match: load that route file and follow it.
4. Two strong matches: pick the one that reduces harm first. An incident beats a deploy, a rollback beats a deploy.
5. No strong match: do not guess. Ask one question that separates the two closest routes.
6. Say which route you picked and why in one line before you act.

## Regression

`evals/routing.md` lists requests and the route each must take. Re-check it whenever this description or the routes table changes.
