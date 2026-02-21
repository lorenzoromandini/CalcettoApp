import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@calcetto-manager.com"

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`

  if (process.env.NODE_ENV === "development") {
    console.log("Verification URL:", verificationUrl)
  }

  if (!resend) {
    console.log("[DEV] Email not sent - no Resend API key")
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verifica la tua email - Calcetto Manager",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Benvenuto in Calcetto Manager!</h1>
          <p>Ciao ${firstName},</p>
          <p>Grazie per esserti registrato. Clicca sul link qui sotto per verificare la tua email:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Verifica Email
          </a>
          <p>Oppure copia e incolla questo link nel browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>Il link scadrà tra 24 ore.</p>
          <p>Se non hai richiesto questa email, puoi ignorarla.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw new Error("Impossibile inviare l'email di verifica")
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`

  if (process.env.NODE_ENV === "development") {
    console.log("Password Reset URL:", resetUrl)
  }

  if (!resend) {
    console.log("[DEV] Password reset email not sent - no Resend API key")
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reimposta la tua password - Calcetto Manager",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Reimposta Password</h1>
          <p>Ciao ${firstName},</p>
          <p>Abbiamo ricevuto una richiesta per reimpostare la tua password. Clicca sul link qui sotto:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reimposta Password
          </a>
          <p>Oppure copia e incolla questo link nel browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>Il link scadrà tra 1 ora.</p>
          <p>Se non hai richiesto questa email, puoi ignorarla.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw new Error("Impossibile inviare l'email di reset password")
  }
}
