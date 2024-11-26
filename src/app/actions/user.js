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

export async function currentUserDetails() {
  const session = await getUser();
  if (session) {
    return { user: session.user };
  } else {
    return null;
  }
}

export async function currentOptimizedValue(email) {
  const res = await prisma.user.findUnique({ where: { username: email } });
  return res.optimised;
}

export async function setOptimised(str, userId) {
  const res = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      optimised: str,
    },
  });
  return res;
}

export async function getUserName(email) {
  const res = await prisma.user.findFirst({ where: { username: email } });
  return res;
}

export async function getUserId(email) {
  const res = await prisma.user.findUnique({ where: { username: email } });
  return res;
}

export async function getManagerId(email) {
  const idMap = new Map();
  idMap.set(process.env.ENGG_MANAGER, "#ME01");
  idMap.set(process.env.SIG_MANAGER, "#MS01");
  idMap.set(process.env.TRD_MANAGER, "#MT01");

  if (idMap.has(email)) {
    return idMap.get(email);
  } else {
    return "";
  }
}

export async function getUserUnderManager(managerId) {
  const res = await prisma.user.findMany({ where: { manager: managerId } });
  const result = res.map((e) => e?.id);
  return result;
}

export async function getUsersByDept(dept) {
  const res = await prisma.user.findMany({
    where: { selectedManager: dept },
  });
  return res;
}

export async function getUserById(id) {
  const res = await prisma.user.findUnique({ where: { id: id } });
  return res;
}

export async function getUserByName(name) {
  const res = await prisma.user.findMany({ where: { name: name } });
  return res;
}

export async function getUsersAll() {
  const res = await prisma.user.findMany();
  return res;
}

export async function userCheck(username, password) {
  const manager_array = [
    process.env.ENGG_MANAGER,
    process.env.SIG_MANAGER,
    process.env.TRD_MANAGER,
  ];
  let manager_password = new Map();
  manager_password.set(manager_array[0], process.env.ENGG_PASS);
  manager_password.set(manager_array[1], process.env.SIG_PASS);
  // manager_password.set(manager_array[2], process.env.TRD_PASS);

  console.log(manager_password);
  console.log(manager_array);

  if (manager_array.includes(username)) {
    if (manager_password.get(username) !== password) {
      return { success: false, error: "Password Does Not Match" };
    } else {
      return { success: true, msg: "Correct details" };
    }
  } else {
    const res = await prisma.user.findUnique({ where: { username: username } });
    if (res == null) {
      return { success: false, error: "No User Exist" };
    } else if (res.password !== password) {
      return { success: false, error: "Password Does Not Match" };
    } else {
      return { success: true, msg: "Correct details" };
    }
  }
}

export async function updateName(name, email) {
  const res = await prisma.user.update({
    where: {
      username: email,
    },
    data: {
      name: name,
    },
  });
  return res;
}

export async function deleteUserData(email) {
  const res = await prisma.user.delete({
    where: {
      username: email,
    },
  });
  return res;
}
