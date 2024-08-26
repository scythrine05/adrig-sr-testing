"use server";

import prisma from "../../lib/prisma";
import { error } from "console";

export const sendUserData = async (name, username, password) => {
  try {
    const res = prisma.user.create({ data: { name, username, password } });
    return {
      message: "The user has been created sucessfully",
      success: true,
      user: res,
    };
  } catch (e) {
    return { message: "Error sending email", error: e, success: false };
  }
};
