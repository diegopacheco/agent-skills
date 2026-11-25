# data-dream: two nights on the shop-api sample

Every command of the two nights, with its real output, in order. Between the nights a developer fixed some of the findings by hand. data-dream never edits production code.

### night 1: start the app

```
$ scripts/start-all.sh
api: http://localhost:4170
```

### night 1: dream

```
$ node dream.mjs dream --plan data-dream/plan.json --memory data-dream/memory.json --journal data-dream/journal.md
night 1 cycle 1: fired 300, nightmares 45, new kinds 16
night 1 cycle 2: fired 187, nightmares 97, new kinds 2
night 1 cycle 3: fired 285, nightmares 68, new kinds 0
night 1 woke: no new kind of nightmare in cycle 3
memory: 1 nights, 210 nightmares, 18 open kinds
```

### night 1: stop the app

```
$ scripts/stop-all.sh
api stopped, port 4170 free
```

### between the nights: the developer fixes DD2, DD1 and part of DD9

```diff
diff --git a/src/app.mjs b/src/app.mjs
index 5f62559..3ab3bef 100644
--- a/src/app.mjs
+++ b/src/app.mjs
@@ -5,7 +5,14 @@ export function createApp(store = createStore()) {
   return createServer(async (req, res) => {
     const url = new URL(req.url, "http://localhost");
     try {
-      const body = req.method === "POST" ? JSON.parse(await read(req)) : null;
+      let body = null;
+      if (req.method === "POST") {
+        try {
+          body = JSON.parse(await read(req));
+        } catch {
+          return send(res, 400, { error: "body must be valid JSON" });
+        }
+      }
       if (req.method === "POST" && url.pathname === "/users") return send(res, 201, store.addUser(body));
       if (req.method === "GET" && url.pathname === "/users") return send(res, 200, store.searchUsers(url.searchParams.get("q") ?? ""));
       if (req.method === "POST" && url.pathname === "/orders") return send(res, 201, store.addOrder(body));
diff --git a/src/store.mjs b/src/store.mjs
index fb15aa8..ff39f3f 100644
--- a/src/store.mjs
+++ b/src/store.mjs
@@ -6,6 +6,9 @@ export function createStore() {
     if (!name || !email) {
       throw new ValidationError("name and email are required");
     }
+    if (typeof name !== "string") {
+      throw new ValidationError("name must be text");
+    }
     const clean = name.trim();
     if (users.some((u) => u.email === email)) {
       throw new ValidationError("email already registered");
@@ -24,6 +27,9 @@ export function createStore() {
     if (!users.some((u) => u.id === userId)) {
       throw new ValidationError("unknown user");
     }
+    if (!createdAt) {
+      throw new ValidationError("createdAt is required");
+    }
     if (typeof price !== "number" || !Number.isInteger(qty) || qty < 1) {
       throw new ValidationError("price must be a number and qty a positive integer");
     }
```

### night 2: start the app

```
$ scripts/start-all.sh
api: http://localhost:4170
```

### night 2: dream, memory replays first

```
$ node dream.mjs dream --plan data-dream/plan.json --memory data-dream/memory.json --journal data-dream/journal.md
night 2 replay: 207 old nightmares, 82 recur, 125 healed
night 2 cycle 1: fired 256, nightmares 0, new kinds 0
night 2 cycle 2: fired 210, nightmares 10, new kinds 0
night 2 woke: no new kind of nightmare in cycle 2
memory: 2 nights, 220 nightmares, 8 open kinds
```

### night 2: stop the app

```
$ scripts/stop-all.sh
api stopped, port 4170 free
```
