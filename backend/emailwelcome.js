//mail for welcome
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'jeyakumarshakithyan@gmail.com',
    pass: 'vsehajwjhikmuopb',
  },
});

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const info = await transporter.sendMail({
      from: 'your_email@example.com',
      to: userEmail,
      subject: 'Welcome to Our Platform',
      html: generateWelcomeEmailTemplate(userName),
    });
    console.log('Welcome email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending welcome email: ', error);
  }
};

const generateWelcomeEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Welcome to Our Platform</title>
    </head>
    <body>
        <h1>Welcome, ${userName}!</h1>
        <p>Thank you for signing up with our platform.</p>
        <p>We are excited to have you onboard.</p>
        <p>Feel free to explore and enjoy our services.</p>
        <p>Best regards,</p>
        <p>The VJ-Creations Team</p>
    </body>
    </html>
  `;
};
