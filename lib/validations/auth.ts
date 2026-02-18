import { z } from "zod";

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

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "L'email è obbligatoria")
      .email("Inserisci un indirizzo email valido"),
    firstName: z
      .string()
      .min(1, "Il nome è obbligatorio")
      .min(2, "Il nome deve avere almeno 2 caratteri"),
    lastName: z
      .string()
      .min(1, "Il cognome è obbligatorio")
      .min(2, "Il cognome deve avere almeno 2 caratteri"),
    nickname: z
      .string()
      .max(30, "Il nickname può avere al massimo 30 caratteri")
      .optional()
      .or(z.literal("")),
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

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un indirizzo email valido"),
});

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

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "La password attuale è obbligatoria"),
    newPassword: z
      .string()
      .min(1, "La nuova password è obbligatoria")
      .min(6, "La password deve essere di almeno 6 caratteri"),
    confirmPassword: z
      .string()
      .min(1, "Conferma la nuova password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z
    .string()
    .min(1, "Il cognome è obbligatorio")
    .min(2, "Il cognome deve avere almeno 2 caratteri"),
  nickname: z
    .string()
    .max(30, "Il nickname può avere al massimo 30 caratteri")
    .optional()
    .or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
