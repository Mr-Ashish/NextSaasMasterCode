import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY); // Make sure your Resend API key is stored in an environment variable

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
) {
  try {
    const emailResponse = await resend.emails.send({
      from: 'support@microapplab.com', // Use your verified sender email
      to,
      subject,
      html: htmlContent,
    });
    if (emailResponse.error) {
      console.error('Failed to send email:', emailResponse.error);
      return { success: false, error: emailResponse.error.message };
    }
    return emailResponse;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email.');
  }
}
