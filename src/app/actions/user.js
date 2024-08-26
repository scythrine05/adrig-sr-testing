"use server";

import prisma from "../../lib/prisma";
import { getUser } from "../../lib/auth";

export default async function currentUser() {
  const session = await getUser();
  if (session) {
    return { user: session.user?.email };
  } else {
    return null;
  }
}

export async function getUserId(email) {
  const res = await prisma.user.findUnique({ where: { username: email } });
  return res;
}
