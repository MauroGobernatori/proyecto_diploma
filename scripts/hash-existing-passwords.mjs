import { PrismaClient } from "@prisma/client";
import nextEnv from "@next/env";
import argon2 from "argon2";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const options = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};
const argon2idHashPattern = /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+={0,2}\$[A-Za-z0-9+/]+={0,2}$/;

try {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, contraseniaHash: true },
  });
  let actualizadas = 0;

  for (const usuario of usuarios) {
    if (argon2idHashPattern.test(usuario.contraseniaHash)) continue;

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        contraseniaHash: await argon2.hash(usuario.contraseniaHash, options),
      },
    });
    actualizadas += 1;
  }

  console.info(`Se actualizaron ${actualizadas} contraseñas.`);
} catch {
  console.error("No se pudieron actualizar las contraseñas existentes.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
