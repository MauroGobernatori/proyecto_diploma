-- Rename the existing column without dropping user data. Existing plaintext
-- values must be converted with scripts/hash-existing-passwords.ts before
-- enabling the new login flow.
ALTER TABLE "Usuario" RENAME COLUMN "contrasenia" TO "contraseniaHash";
