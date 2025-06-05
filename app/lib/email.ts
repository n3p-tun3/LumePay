import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string | null, password: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Lume Pay <noreply@pyrrho.dev>',
      to: email,
      subject: 'Welcome to Lume Pay! Your Account is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Lume Pay!</h1>
          
          <p>Hello ${name || 'there'},</p>
          
          <p>Great news! Your waitlist application has been approved, and your Lume Pay account is now ready to use.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Your Account Details</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
          </div>
          
          <p style="color: #dc2626; font-weight: bold;">Important: Please change your password after your first login.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Log in to your account at <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login">${process.env.NEXT_PUBLIC_APP_URL}/auth/login</a></li>
            <li>Set up your bank account details</li>
            <li>Generate your API key</li>
            <li>Start accepting payments</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The Lume Pay Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
} 