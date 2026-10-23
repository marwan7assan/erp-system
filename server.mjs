import { createServer } from "node:http";
import { randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize } from "node:path";

const scrypt = promisify(scryptCallback);
const port = Number(process.env.PORT || 3001);
const dataDirectory = join(process.cwd(), "data");
const usersFile = join(dataDirectory, "users.json");
const sessions = new Map();
const passwordResetCodes = new Map();
const failedAttempts = new Map();
const rateLimitWindow = 15 * 60 * 1000;
const maxAttempts = 5;
let lastPurge = 0;
const mimeTypes = { ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".html": "text/html" };

async function getUsers() {
  try { return JSON.parse(await readFile(usersFile, "utf8")); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(usersFile, "[]", "utf8");
    return [];
  }
}

async function saveUsers(users) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${usersFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(users, null, 2), "utf8");
  await rename(temporaryFile, usersFile);
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = (await scrypt(password, salt, 64)).toString("hex");
  return `${salt}:${hash}`;
}

async function passwordMatches(password, stored) {
  const [salt, storedHash] = stored.split(":");
  const calculated = (await scrypt(password, salt, 64)).toString("hex");
  return timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(calculated, "hex"));
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json", ...headers });
  response.end(JSON.stringify(body));
}

function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }

async function readBody(request) {
  let raw = "";
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 100 * 1024) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    raw += chunk;
  }
  return JSON.parse(raw || "{}");
}

function purgeExpired() {
  if (Date.now() - lastPurge < 60 * 1000) return;
  lastPurge = Date.now();
  for (const [token, session] of sessions) if (session.expiresAt < Date.now()) sessions.delete(token);
  for (const [email, reset] of passwordResetCodes) if (reset.expiresAt < Date.now()) passwordResetCodes.delete(email);
  for (const [key, attempt] of failedAttempts) if (attempt.expiresAt < Date.now()) failedAttempts.delete(key);
}

function attemptKey(request, email) {
  return `${request.socket.remoteAddress || "unknown"}:${email}`;
}

function isRateLimited(request, email) {
  const attempt = failedAttempts.get(attemptKey(request, email));
  return attempt && attempt.count >= maxAttempts && attempt.expiresAt > Date.now();
}

function recordFailedAttempt(request, email) {
  const key = attemptKey(request, email);
  const attempt = failedAttempts.get(key);
  failedAttempts.set(key, {
    count: (attempt?.expiresAt > Date.now() ? attempt.count : 0) + 1,
    expiresAt: Date.now() + rateLimitWindow,
  });
}

function clearFailedAttempts(request, email) {
  failedAttempts.delete(attemptKey(request, email));
}

function createSession(response, user) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
  response.setHeader("Set-Cookie", `erp_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`);
}

async function handleApi(request, response, path) {
  purgeExpired();
  const sessionToken = parseCookies(request).erp_session;
  const session = sessions.get(sessionToken);
  if (session?.expiresAt < Date.now()) sessions.delete(sessionToken);

  if (request.method === "GET" && path === "/api/auth/session") {
    if (!session || session.expiresAt < Date.now()) return send(response, 401, { message: "Not authenticated." });
    const user = (await getUsers()).find((item) => item.id === session.userId);
    return user ? send(response, 200, { user: publicUser(user) }) : send(response, 401, { message: "Not authenticated." });
  }

  if (request.method === "POST" && path === "/api/auth/logout") {
    if (sessionToken) sessions.delete(sessionToken);
    return send(response, 200, { ok: true }, { "Set-Cookie": "erp_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
  }

  const body = await readBody(request);
  const { name, email, password, code, currentPassword, newPassword } = body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (request.method === "POST" && path === "/api/auth/forgot-password") {
    if (!normalizedEmail) return send(response, 400, { message: "Email is required." });
    const user = (await getUsers()).find((item) => item.email === normalizedEmail);
    const result = { message: "If an account exists for this email, a reset code has been created." };
    if (user) {
      const resetCode = String(randomInt(100000, 1000000));
      passwordResetCodes.set(normalizedEmail, { code: resetCode, expiresAt: Date.now() + 15 * 60 * 1000, wrongAttempts: 0 });
      if (process.env.NODE_ENV !== "production") result.developmentCode = resetCode;
    }
    return send(response, 200, result);
  }

  if (request.method === "POST" && path === "/api/auth/reset-password") {
    if (!normalizedEmail || typeof code !== "string" || typeof password !== "string") {
      return send(response, 400, { message: "Email, reset code, and new password are required." });
    }
    if (password.length < 8) return send(response, 400, { message: "Password must be at least 8 characters." });

    if (isRateLimited(request, normalizedEmail)) return send(response, 429, { message: "Too many attempts. Please try again later." });
    const reset = passwordResetCodes.get(normalizedEmail);
    if (!reset || reset.expiresAt < Date.now() || reset.code !== code.trim()) {
      recordFailedAttempt(request, normalizedEmail);
      if (reset) {
        reset.wrongAttempts += 1;
        if (reset.wrongAttempts >= maxAttempts) passwordResetCodes.delete(normalizedEmail);
      }
      return send(response, 400, { message: "The reset code is invalid or has expired." });
    }

    const users = await getUsers();
    const userIndex = users.findIndex((item) => item.email === normalizedEmail);
    if (userIndex === -1) return send(response, 400, { message: "The reset code is invalid or has expired." });
    users[userIndex] = { ...users[userIndex], passwordHash: await hashPassword(password) };
    await saveUsers(users);
    passwordResetCodes.delete(normalizedEmail);
    clearFailedAttempts(request, normalizedEmail);
    return send(response, 200, { message: "Password reset successfully. You can now sign in." });
  }

  if (request.method === "POST" && path === "/api/auth/change-password") {
    if (!session || session.expiresAt < Date.now()) return send(response, 401, { message: "Not authenticated." });
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return send(response, 400, { message: "Current and new passwords are required." });
    }
    const users = await getUsers();
    const userIndex = users.findIndex((item) => item.id === session.userId);
    const user = users[userIndex];
    if (!user || isRateLimited(request, user.email)) return send(response, 429, { message: "Too many attempts. Please try again later." });
    if (!(await passwordMatches(currentPassword, user.passwordHash))) {
      recordFailedAttempt(request, user.email);
      return send(response, 401, { message: "Current password is incorrect." });
    }
    if (newPassword.length < 8) return send(response, 400, { message: "Password must be at least 8 characters." });
    if (currentPassword === newPassword) return send(response, 400, { message: "New password must be different." });
    users[userIndex] = { ...user, passwordHash: await hashPassword(newPassword) };
    await saveUsers(users);
    clearFailedAttempts(request, user.email);
    return send(response, 200, { message: "Password updated successfully." });
  }

  if (!normalizedEmail || typeof password !== "string") return send(response, 400, { message: "Email and password are required." });
  const users = await getUsers();

  if (request.method === "POST" && path === "/api/auth/signup") {
    if (typeof name !== "string" || !name.trim()) return send(response, 400, { message: "Name is required." });
    if (password.length < 8) return send(response, 400, { message: "Password must be at least 8 characters." });
    if (users.some((user) => user.email === normalizedEmail)) return send(response, 409, { message: "An account already exists for this email." });
    const user = { id: randomBytes(16).toString("hex"), name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) };
    await saveUsers([...users, user]);
    createSession(response, user);
    return send(response, 201, { user: publicUser(user) });
  }

  if (request.method === "POST" && path === "/api/auth/login") {
    if (isRateLimited(request, normalizedEmail)) return send(response, 429, { message: "Too many attempts. Please try again later." });
    const user = users.find((item) => item.email === normalizedEmail);
    if (!user || !(await passwordMatches(password, user.passwordHash))) {
      recordFailedAttempt(request, normalizedEmail);
      return send(response, 401, { message: "Invalid email or password." });
    }
    clearFailedAttempts(request, normalizedEmail);
    createSession(response, user);
    return send(response, 200, { user: publicUser(user) });
  }

  return send(response, 404, { message: "Not found." });
}

const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, `http://${request.headers.host}`).pathname;
    if (path.startsWith("/api/")) return await handleApi(request, response, path);
    const relative = path === "/" ? "index.html" : normalize(path).replace(/^([/\\])+/, "");
    const file = join(process.cwd(), "dist", relative);
    if (!file.startsWith(join(process.cwd(), "dist"))) return response.end();
    createReadStream(file).on("error", () => createReadStream(join(process.cwd(), "dist", "index.html")).pipe(response))
      .on("open", () => response.setHeader("Content-Type", mimeTypes[extname(file)] || "application/octet-stream")).pipe(response);
  } catch (error) { send(response, error.statusCode || 500, { message: error.statusCode ? error.message : "Internal server error." }); }
});

server.listen(port, () => console.log(`ERP server is running on http://localhost:${port}`));
