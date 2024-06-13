import nodemailer from 'nodemailer';

// Email setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: '123@gmail.com',
    pass: '123', // App password if 2-Step Verification is enabled
  },
});

export const sendOrderDeletionEmail = async (
  userEmail,
  userName,
  orderDetails
) => {
  try {
    const info = await transporter.sendMail({
      from: 'jeyakumarshakithyan@gmail.com', // Should match your Gmail address
      to: userEmail,
      subject: 'Order Deletion Notification',
      html: generateOrderDeletionEmailTemplate(userName, orderDetails),
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

const generateOrderDeletionEmailTemplate = (userName, orderDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Deletion Notification</title>
    </head>
    <body>
      <h1>Order Deletion Notification</h1>
      <p>Hello ${userName},</p>
      <p>We regret to inform you that your order with the following details has been canceled:</p>
      <ul>
        <li>Order ID: ${orderDetails._id}</li>
        <li>Total Price: ${orderDetails.totalPrice}</li>
        <li>Items:</li>
        <ul>
          ${orderDetails.orderItems
            .map(
              (item) =>
                `<li>${item.name} - Quantity: ${item.quantity}, Price: ${item.price}</li>`
            )
            .join('')}
        </ul>
      </ul>
      <p>We apologize for any inconvenience caused.</p>
    </body>
    </html>
  `;
};
