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
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h2 style="color: #dc2626; margin-top: 0;">Important Actions Required</h2>
            <ol>
              <li><strong>Change your password</strong> after your first login for security</li>
              <li><strong>Update your name</strong> to match exactly with your CBE bank account name for payment verification</li>
            </ol>
          </div>
          
          <p>You can now:</p>
          <ul>
            <li>Log in to your account at <a href="${process.env.NEXT_PUBLIC_API_URL}/auth/login">${process.env.NEXT_PUBLIC_API_URL}/auth/login</a></li>
            <li>Update your name in Settings to match your bank account</li>
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

export async function sendPasswordResetEmail(email: string, name: string | null, token: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${token}`;
    
    const { data, error } = await resend.emails.send({
      from: 'Lume Pay <noreply@pyrrho.dev>',
      to: email,
      subject: 'Reset Your Lume Pay Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Reset Your Password</h1>
          
          <p>Hello ${name || 'there'},</p>
          
          <p>We received a request to reset your password for your Lume Pay account. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>If you didn't request this password reset, you can safely ignore this email. The link will expire in 24 hours.</p>
          
          <p>For security reasons, this link can only be used once. If you need to reset your password again, please request another reset link.</p>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br>The Lume Pay Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          
          <p style="color: #6b7280; font-size: 12px;">
            If the button above doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
} 