import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendVerificationOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Email Verification',
    text: `Your OTP for email verification is: ${otp}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Email Confirmation</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        /* Add your styles here */
      </style>
    </head>
    <body style="background-color: #e9ecef;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Test - 2</h1>
                  <h2 style="margin: 0; font-size: 28px; font-weight: 600;">Confirm Your OTP</h2>
                </td>
              </tr>
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p>Your OTP for email verification is:</p>
                </td>
              </tr>
              <tr>
                <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                  <h1 style="background-color: #1a82e2; color: #ffffff; padding: 16px; border-radius: 6px;">${otp}</h1>
                </td>
              </tr>
              <tr>
                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                  <p>Author : NH-ANik Full stack developer</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export default sendVerificationOTP;
