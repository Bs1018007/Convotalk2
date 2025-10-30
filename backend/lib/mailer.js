import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,    
    pass: process.env.EMAIL_PASS,
  },
});

export const sendNotificationMail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials not configured.");
      return false;
    }

    const mailOptions = {
      from: '"ConvoTalk" <no-reply@convotalk.com>',
      to,
      subject,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};
