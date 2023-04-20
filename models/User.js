const mongoose = require("mongoose");
const validator = require("validator");

// Declaring schemas

const UserSchema = new mongoose.Schema(
    {
        user_id: {type: String, required: true, unique: true},
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
        isRegulator: {type: Boolean, default: false},
        isAdmin: {type: Boolean, default: false},
    },
    { timestamps: true }
);

// Creating models
User = mongoose.model("User", UserSchema);

// Exporting all the models
module.exports = User;