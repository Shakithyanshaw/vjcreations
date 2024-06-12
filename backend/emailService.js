import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: '123@gmail.com',
    pass: '123',
  },
});

export const sendOrderConfirmationEmail = async (
  userEmail,
  userName,
  orderDetails
) => {
  try {
    const info = await transporter.sendMail({
      from: 'your_email@example.com',
      to: userEmail,
      subject: 'Order Confirmation',
      html: generateOrderEmailTemplate(userName, orderDetails),
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

const generateOrderEmailTemplate = (userName, orderDetails) => {
  // Generate HTML email template with user name and order details
  const orderItems = orderDetails.orderItems.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  const shippingAddress = orderDetails.shippingAddress;
  const eventDate = new Date(shippingAddress.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const eventTime = new Date(`1970-01-01T${shippingAddress.time}Z`);
  const formattedTime = eventTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Confirmation</title>
        </head>
        <body>
            <h1>Order Confirmation</h1>
            <p>Hello ${userName},</p>
            <p>Your order with the following details has been successfully placed:</p>
            <ul>
                ${orderItems
                  .map(
                    (item) =>
                      `<li>${item.name} - Quantity: ${item.quantity}, Price: ${item.price}</li>`
                  )
                  .join('')}
            </ul>
            <p>Total Price: ${orderDetails.totalPrice}</p>
            <p>Event Address:</p>
            <p>${shippingAddress.address}, ${shippingAddress.city}, ${
    shippingAddress.postalCode
  }, ${shippingAddress.country}</p>
            <p>Event Date: ${formattedDate}</p>
            <p>Event Time: ${formattedTime}</p>
            <p>Thank you for shopping with VJ-Creations!</p>
        </body>
        </html>
    `;
};
