import { z } from "zod";

// Login schema - email and password
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un indirizzo email valido"),
  password: z
    .string()
    .min(1, "La password è obbligatoria")
    .min(6, "La password deve essere di almeno 6 caratteri"),
});

// Signup schema - email, password, confirm password
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "L'email è obbligatoria")
      .email("Inserisci un indirizzo email valido"),
    password: z
      .string()
      .min(1, "La password è obbligatoria")
      .min(6, "La password deve essere di almeno 6 caratteri"),
    confirmPassword: z
      .string()
      .min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// Forgot password schema - email only
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un indirizzo email valido"),
});

// Reset password schema - new password and confirmation
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "La password è obbligatoria")
      .min(6, "La password deve essere di almeno 6 caratteri"),
    confirmPassword: z
      .string()
      .min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// Type inference for forms
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
