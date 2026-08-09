const cookieName = "seu_campus_admin";
const sessionLifetimeSeconds = 8 * 60 * 60;

function encodeBase64Url(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signature(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return encodeBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_ACCESS_TOKEN && process.env.ADMIN_ACCESS_TOKEN.length >= 12);
}

export async function credentialsMatch(candidate) {
  if (!adminConfigured() || typeof candidate !== "string") return false;
  const expected = await signature("credential-check", process.env.ADMIN_ACCESS_TOKEN);
  const actual = await signature("credential-check", candidate);
  return safeEqual(expected, actual);
}

export async function createSessionCookie() {
  const expires = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = encodeBase64Url(JSON.stringify({ expires }));
  const token = `${payload}.${await signature(payload, process.env.ADMIN_ACCESS_TOKEN)}`;
  return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${sessionLifetimeSeconds}`;
}

export function clearSessionCookie() {
  return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAdminRequest(request) {
  if (!adminConfigured()) return false;
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split(/;\s*/).find((entry) => entry.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!token) return false;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return false;
  const expectedSignature = await signature(payload, process.env.ADMIN_ACCESS_TOKEN);
  if (!safeEqual(expectedSignature, suppliedSignature)) return false;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(normalized));
    return Number(decoded.expires) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function hasValidOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export function json(payload, status = 200, headers = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}
