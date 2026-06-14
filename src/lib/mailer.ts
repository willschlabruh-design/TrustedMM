import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

let resend: any = null;
let transporter: any = null;

if(RESEND_API_KEY){
  resend = new Resend(RESEND_API_KEY);
} else if(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS){
  transporter = nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

export async function sendVerificationEmail(to: string, link: string){
  const subject = 'Verify your email';
  const text = `Please verify your email by visiting the following link:\n\n${link}\n\nIf you did not sign up, ignore this message.`;
  const html = `<p>Please verify your email by clicking <a href="${link}">this link</a>.</p><p>If you did not sign up, ignore this message.</p>`;

  // Try Resend first
  if(resend){
    try{
      await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
      return;
    } catch(e){
      console.error('Resend failed, trying SMTP:', e);
    }
  }

  // Try SMTP
  if(transporter){
    try{
      await transporter.sendMail({ from: FROM_EMAIL, to, subject, text, html });
      return;
    } catch(e){
      console.error('SMTP failed:', e);
    }
  }

  // Fallback: log link to console for dev
  console.log(`✉️ Verification email for ${to}\n${link}`);
}
