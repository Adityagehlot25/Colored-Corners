const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Log into your Gmail "Post Office"
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // smtp.gmail.com
    port: process.env.EMAIL_PORT, // 465
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    }
  });

  // 2. Draft the email
  const mailOptions = {
    from: `"Coloured Corners Admin" <${process.env.EMAIL_USER}>`, // Who it's from
    to: options.email,                                            // Who is receiving it (the user)
    subject: options.subject,
    text: options.message,
  };

  // 3. Send it!
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;