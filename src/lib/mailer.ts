import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

let resend: any = null;
if (RESEND_API_KEY) resend = new Resend(RESEND_API_KEY);

export async function sendVerificationEmail(to: string, link: string){
  const subject = 'Verify your email';
  const html = `<p>Please verify your email by clicking <a href="${link}">this link</a>.</p><p>If you did not sign up, ignore this message.</p>`;

  if(resend){
    try{
      await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
      return;
    }catch(e){ console.error('Resend failed', e); }
  }

  // Fallback: log link to console for dev
  console.log(`Verification email for ${to}: ${link}`);
}

export async function sendEmail(to: string, subject: string, html: string, text?: string){
  if(!text) text = html.replace(/<[^>]+>/g, '');

  if(resend){
    try{
      await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
      return;
    }catch(e){ console.error('Resend send failed', e); }
  }

  console.log(`Email fallback for ${to} — subject: ${subject}\n${text}`);
}
