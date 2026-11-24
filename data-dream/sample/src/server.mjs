import { createApp } from "./app.mjs";

const port = Number(process.env.API_PORT || 4170);
createApp().listen(port, "127.0.0.1", () => console.log(`shop-api on http://localhost:${port}`));
