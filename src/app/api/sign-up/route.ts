import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserCheckByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserCheckByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserCheckByEmail = await UserModel.findOne({ email });
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUserCheckByEmail) {
      if (existingUserCheckByEmail.isVerified) {
        return Response.json({
          success: false,
          message: "User already exist with this email, and is a verified user",
        });
      } else {
        existingUserCheckByEmail.password = hashedPassword;
        existingUserCheckByEmail.verifyCode = verifyCode;
        existingUserCheckByEmail.verifyCodeExpiry = expiryDate;

        await existingUserCheckByEmail.save();
      }
    } else {
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send otp email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registration successful",
        additionalMessage: emailResponse.message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error registering user\n" + error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
