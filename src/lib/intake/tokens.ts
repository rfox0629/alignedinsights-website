import crypto from "crypto";

export function generateIntakeToken() {
  return crypto.randomBytes(24).toString("base64url");
}
