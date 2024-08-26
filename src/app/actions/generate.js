"use server";
import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";
import nodemailer from "nodemailer";
import { error } from "console";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, otp) => {
  const mailOptions = {
    from: "prashant67670@gmail.com",
    to: email,
    subject: "Your OTP Code",
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Adrig AI</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Adrig Ai. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Adrig AI</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Adrig Ai</p>
      <p>Chennai</p>
      <p>India</p>
    </div>
  </div>
</div>`,
  };

  let info = await transporter.sendMail(mailOptions);
  console.log("Email Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

// API route handler for generating and sending OTP
export default async function getGeneratedOtp(email) {
  try {
    if (!email) {
      return { message: "Email or phone number is required" };
    }

    const history = await prisma.otp.findMany({
      where: {
        email,
      },
    });

    if (history != null) {
      const now = new Date();
      await prisma.otp.deleteMany({
        where: {
          email,
        },
      });
    }

    const otp = generateOtp();
    const hashedOtp = bcrypt.hashSync(otp, 10);

    const validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + 10);

    const newOtp = await prisma.otp.create({
      data: {
        email,
        code: hashedOtp,
        validTill: validUntil,
      },
    });

    await sendEmail(email, otp);
  } catch (error) {
    return {
      message: "Invalid delivery method or missing contact information",
    };
  }

  return { message: "OTP sent successfully" };
}
