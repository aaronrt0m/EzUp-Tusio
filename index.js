import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { FileStore } from "@tus/file-store";
import { Server as TusServer } from "@tus/server";

const port = Number(process.env.PORT || 10000);
const uploadDirectory = process.env.UPLOAD_DIR || "./uploads";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  throw new Error("Set ALLOWED_ORIGINS to the origin hosting the EzUp website.");
}

await mkdir(uploadDirectory, { recursive: true });

const tusServer = new TusServer({
  path: "/files",
  datastore: new FileStore({ directory: uploadDirectory }),
  allowedOrigins,
  maxSize: 25 * 1024 * 1024,
  respectForwardedHeaders: true,
});

const httpServer = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/healthz") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("ok");
    return;
  }

  if (request.url === "/files" || request.url?.startsWith("/files/")) {
    tusServer.handle(request, response);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end("Not found");
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`EzUp tus server listening on port ${port}`);
});
