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

export async function getManagerForUser(email) {
  const res = await prisma.user.findUnique({ where: { username: email } });
  const managerName = await prisma.manager.findUnique({ where: { id: res.manager } }); 
  return managerName ? managerName.name : "";
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
export async function getManager(email) {
  const res = await prisma.manager.findUnique({ where: { email } });
  console.log(res,"manager")
  return res;
}

export async function getUserId(email) {
  const res = await prisma.user.findFirst({ where: { username: email } });
  return res;
}

export async function getManagerId(email) {
  const res = await prisma.manager.findUnique({ where: { email } });
  return res ? res.id : "";
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
  const manager_data = await prisma.manager.findUnique({
    where: {
      email: username,
    },
  });

  if (manager_data != null) {
    if (manager_data.password !== password) {
      return { success: false, error: "Password Does Not Match" };
    } else {
      return { success: true, msg: "Correct details" };
    }
  } else {
    const res = await prisma.user.findUnique({ where: { username } });
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

export async function getUserByEmail(email) {
  const user = await prisma.user.findFirst({
    where: {
      username: email,
    },
  });
  return user;
}

export {getUser,currentUser}
