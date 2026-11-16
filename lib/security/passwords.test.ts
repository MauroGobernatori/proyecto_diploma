import { describe, expect, it } from "vitest";
import { hashPassword, isArgon2idHash, verifyPassword } from "./passwords";

describe("passwords", () => {
  it("stores an Argon2id hash and verifies only the matching password", async () => {
    const hash = await hashPassword("una-clave-larga-y-segura");

    expect(isArgon2idHash(hash)).toBe(true);
    expect(hash).not.toContain("una-clave-larga-y-segura");
    await expect(verifyPassword(hash, "una-clave-larga-y-segura")).resolves.toBe(true);
    await expect(verifyPassword(hash, "otra-clave")).resolves.toBe(false);
  });

  it("does not accept plaintext or malformed values as a password hash", async () => {
    await expect(verifyPassword("texto-plano", "texto-plano")).resolves.toBe(false);
    expect(isArgon2idHash("$argon2id$texto-plano")).toBe(false);
  });
});
