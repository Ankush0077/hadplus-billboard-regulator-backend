const mongoose = require("mongoose");
const validator = require("validator");

// Declaring schemas

const OTPSchema = new mongoose.Schema(
    {
        user_name: {type: String, required: [true, 'Please enter your username']},
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
              if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
              }
            }
        },
        phone_number: {
            type: String,
            required: [true, 'Please provide a phone number'],
            unique: true,
        },
        password: {
          type: String,
          required: [true, 'Please provide a password'],
          trim: true,
          minlength: 8,
          validate(value) {
            if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
              throw new Error(
                'Password must contain at least one letter and one number'
              );
            }
          },
          // select: false
        },
        otp: {
            type: String,
            required: [true, 'Please provide an otp'],
            trim: true,
            length: 6,
        },
       isRegulator: {type: Boolean, default: false},
    },
    { timestamps: true }
);

// Creating models
OTP = mongoose.model("OTP", OTPSchema);

// Exporting all the models
module.exports = OTP;
