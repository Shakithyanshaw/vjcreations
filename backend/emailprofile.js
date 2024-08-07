//mail for profile update
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'jeyakumarshakithyan@gmail.com',
    pass: 'vsehajwjhikmuopb',
  },
});

export const sendProfileUpdateEmail = async (
  userEmail,
  userName,
  updatedFields
) => {
  try {
    // Generate the HTML content for the email based on updatedFields
    const updatedFieldsContent = Object.keys(updatedFields)
      .map((field) => {
        return `<p>${field}: ${updatedFields[field]}</p>`;
      })
      .join('');

    const info = await transporter.sendMail({
      from: 'your_email@example.com',
      to: userEmail,
      subject: 'Profile Updated',
      html: `<p>Hello ${userName},</p>
             <p>Your profile has been successfully updated with the following changes:</p>
             ${updatedFieldsContent}
             <p>Thank you for using our service.</p>`,
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};
