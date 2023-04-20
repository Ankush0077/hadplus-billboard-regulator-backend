var nodemailer = require('nodemailer');
const logger = require("../../config/logger");

const dotenv = require("dotenv");

dotenv.config();

var transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  }
});

const verifyEmail = (email, name, OTP) => {
    transporter.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Welcome to hadplus - Your OTP for Account Verification',
        text: `Dear ${name},\n\nWe are delighted to welcome you to hadplus. As a new user, we want to ensure the security of your account and make sure that only you have access to it. For this, we require you to verify your account with a One-Time Password (OTP).\n\nYour OTP is: ${OTP}\n\nPlease enter this OTP on the website to complete your account verification process. Note that this OTP is valid only for a limited time, so we recommend that you use it as soon as possible.\n\nWe take the security and privacy of our users very seriously at hadplus, and we use the latest encryption technologies to protect your personal information. Your account information will only be used for the purpose of providing you with our services.\n\nIf you have any questions or concerns, please feel free to contact us at hadplus@hotmail.com. We are always here to assist you.\n\nThank you for choosing hadplus. We look forward working with you.\n\nBest regards,\n\nAnkush Yadav\n\nhadplus Team`
      }, function(error, info){
    if (error) {
        logger.error(error);
    } else {
        logger.info('Email sent: ' + info.response);
    }
    });
}

module.exports = { verifyEmail }