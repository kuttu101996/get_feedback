import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(2, "Content must be atleast two characters")
    .max(500, "Content must be no longer than 500 characters"),
});
