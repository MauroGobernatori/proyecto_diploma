import argon2, { type HashOptions } from "argon2";

const ARGON2_OPTIONS: HashOptions = {
  type: argon2.argon2id as unknown as HashOptions["type"],
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string) {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    // A malformed or legacy plaintext value must never authenticate as a hash.
    return false;
  }
}

export function isArgon2idHash(value: string) {
  return /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+={0,2}\$[A-Za-z0-9+/]+={0,2}$/.test(
    value
  );
}
