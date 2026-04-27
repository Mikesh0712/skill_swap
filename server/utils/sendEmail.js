import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('\n[WARNING] EMAIL_USER or EMAIL_PASS not configured in .env. Reset link will be logged to console instead.\n');
    console.log('==================================================');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('==================================================\n');
    return;
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard gmail service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the email options
  const mailOptions = {
    from: `SkillSwap <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
