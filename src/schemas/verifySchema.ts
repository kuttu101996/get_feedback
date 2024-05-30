import { z } from "zod";

export const verifySchema = z.object({
  verifyCode: z
    .string()
    .length(6, { message: "Verification code must be six digits." }),
});
