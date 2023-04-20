const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const logger = require("../config/logger");
const User = require("../models/User")
const OTP = require("../models/OTP");
const { verifyEmail } = require("../utils/mailer/verify_email.js");
const { verifyTokenAndAuthorization } = require("./verifyToken");

function getRandom(length) {

    return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
    
    }

// Send OTP
router.post("/send_otp", async (request,response) => {
    try {
        email = request.body.email;
        phone_number = request.body.phone_number;

        user_name = request.body.name;

        const user = await User.findOne({
            email: email,
        });

        if(user){
            logger.info("Already existing user tried to sign_up: " + user.email);
            response.status(400).json("User already exists!");
        } else{
            password = CryptoJS.AES.encrypt(request.body.password, process.env.PASSWORD_SECRET_KEY).toString();
            const otp = getRandom(6).toString();

            try {
                const oldOTP = await OTP.findOne({
                    email: email,
                });

                if(oldOTP){
                    const updatedOTP = await OTP.findByIdAndUpdate(oldOTP.id, {
                        $set: {
                            user_name: user_name,
                            email: email,
                            phone_number: phone_number,
                            password: password,
                            otp: otp,
                        }
                    },{new: true});
                    logger.info("Updated OTP: " + updatedOTP);
                }
                else{
                    const newOTP = new OTP(
                        {
                            user_name: user_name,
                            email: email,
                            phone_number: phone_number,
                            password: password,
                            otp: otp,
                        }
                    )
    
                    const savedOTP = await newOTP.save();
                    logger.info("New OTP created" + savedOTP);
                }

                try {
                    verifyEmail(email, user_name, otp);
                    response.status(200).json('OTP sent to your email id. It around takes 1-2 minutes to recieve it.')
                    logger.info("OTP sent to mail: " + email);
                } catch(error) {
                    response.status(500).json("Could not send the OTP.");
                    logger.error("Sending OTP failed: " + error.message);
                }
            } catch(error) {
                response.status(500).json("Could not register new user");
                logger.error("User registration failed: " + error.message);
            }
        }
    } catch(error) {
        response.status(500).json("Could not register new user");
        logger.error("User registration failed: " + error.message);
    }
})

// Register User
router.post("/register", async (request,response) => {
    try {
        email = request.body.email;

        const user = await User.findOne({
            email: email,
        });

        if(user){
            logger.info("Already existing user tried to sign_up: " + user.email);
            response.status(400).json("User already exists!");
        } else{

            const otp = await OTP.findOne({
                email: email,
            });

            if(otp){
                sentOTP = request.body.otp;

                if(sentOTP === otp.otp){
                    userID = `hadplus@${CryptoJS.SHA256(email).toString(CryptoJS.enc.hex)}`;

                    const newUser = new User(
                        {
                            user_id: userID,
                            user_name: otp.user_name,
                            email: email,
                            phone_number: otp.phone_number,
                            password: otp.password,
                        }
                    );

                    const savedUser = await newUser.save();
                    logger.info("New user created" + savedUser);
                    response.status(201).json("Congratulations!!! Your account is created successfully! Login to continue futher.");

                } else {
                    response.status(400).json("OTP doesn't matches. Try again.");
                    logger.error("User registration failed: OTP does not match. " + email);
                }
            } else {
                response.status(400).json("OTP is not sent. Try again.");
                logger.error("User registration failed: No OTP Sent. " + email);
            }
        }
    } catch (error) {
        response.status(500).json("Could not register new user");
        logger.error("User registration failed: " + error.message);
        }
});

router.post("/login", async (request,response) => {
    try {
        email = request.body.email;

        const user = await User.findOne({
            email: email,
        });

        // !user && response.status(401).json("Wrong Credentials!");
        if(!user) {
            response.status(401).json("Wrong Credentials!");
            logger.warn("Login tried with wrong email: " + email);
        }
        else {
            const hashedPassword = CryptoJS.AES.decrypt(
                user.password, 
                process.env.PASSWORD_SECRET_KEY,
            );
    
            const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
            
            // password !== request.body.password && response.status(401).json("Wrong Credentials!");
            if(originalPassword !== request.body.password) {
                response.status(401).json("Wrong Credentials!");
                logger.warn("Somebody trying to login into: " + user.email);
            }
            else {
                const accessToken = jwt.sign(
                    {
                        id: user.user_id,
                        isAdmin: user.isAdmin,
                    },
                    process.env.JWT_SECRET_KEY,
                    {expiresIn: "30d"},
                );
                
                const {password, isAdmin, _id, ...others} = user._doc;
                response.status(200).json({...others, accessToken});
                logger.info("User Login: " + user.email);
            }
        }
       
    } catch (error) {
        response.status(500).json("Login Failed!!");
        logger.error(error.message);
    }
});

router.get("/is-login/:user_id", verifyTokenAndAuthorization, async (request, response) => {
    response.status(200).json("User Logged In!!");
    logger.info("Logged in user visited website: " + request.user.id);
})

module.exports = router;