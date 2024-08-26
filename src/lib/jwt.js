import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "willnotbeused";

export function signJWT(payload, options) {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "7d",
    ...options,
  });
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}
