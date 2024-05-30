import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must contain atleast three characters")
  .max(10, "Username length must not exceed 10 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can not contain special character except underscore(_)"
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast six characters." }),
});
