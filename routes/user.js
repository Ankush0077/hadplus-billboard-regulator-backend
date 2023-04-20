const router = require("express").Router();
const CryptoJS = require("crypto-js");

const User = require("../models/User");
const logger = require("../config/logger");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

router.get("/regulators", verifyToken, async (request, response) => {
    try{
        const regulators = await User.find({isRegulator: true});
        const names = [];
        for(let i = 0; i < regulators.length; i++){
            names.push(regulators[i].user_name)
        }
        console.log(names);
        // const name = regulators._doc;
        // const {name, ...others} = regulators._doc;
        response.status(200).json(names);
        logger.info("Name of regulators sent to: " + request.user.id);
    } catch(error){
        response.status(500).json("Name of Regulators can't be sent.");
        logger.error("Name of Regulators can't be sent: error: " + error.message);
    }
});

// UPDATE USER
router.put("/update/:user_id", verifyTokenAndAuthorization, async (request, response) => {
    user_id = request.params.user_id;
    if(request.body.password) {
        request.body.password = CryptoJS.AES.encrypt(
            request.body.password, 
            process.env.PASSWORD_SECRET_KEY)
            .toString();
    }

    try{
        const user = await User.findOne({
                user_id: user_id,
        });
        if(user){
            const updatedUser = await User.findByIdAndUpdate(user.id, {
                $set: request.body
            },{new: true});
            response.status(200).json(updatedUser);
            logger.info("Updated User: " + user_id);
        } else{
            response.status(500).json("No such user exists!")
            logger.info("Non existing user tried to update its information: " + user_id)
        }
    } catch(error) {
        response.status(500).json("Cannot update your information");
        logger.error("User information could not be updated: " + user_id + " error: " + error.message);
    }
});

// DELETE USER
router.delete("/delete/:user_id", verifyTokenAndAuthorization, async (request, response) => {
    user_id = request.params.user_id;
    try {
        const user = await User.findOne({
            user_id: user_id,
        });
        if(user){
            const deletedUser = await User.findByIdAndDelete(user.id);
            logger.info("User deletion initiated: " + user_id + "\nUser Details:\n"+ JSON.stringify(deletedUser));
            response.status(200).json("User has been deleted");
            logger.info("User has been deleted: " + user_id);
        } else{
            response.status(500).json("No such user exists!")
            logger.info("Non existing user tried to update its information: " + user_id)
        }
    } catch(error) {
        response.status(500).json("Cannot delete user");
        logger.error("Cannot delete user: " + user_id + " error: " + error.message);
      }
});

// GET USER
router.get("/find/:user_id", verifyTokenAndAdmin, async (request, response) => {
    user_id = request.params.user_id;
    try {
        const user = await User.findOne({
            user_id: user_id,
        });
        if(user){
            const getUser = await User.findById(user.id);
            logger.info("User details Requested: " + user_id + "\nUser Details:\n"+ JSON.stringify(getUser));
            const { password, ...others } = getUser._doc;
            response.status(200).json(others);
        } else{
            response.status(500).json("No such user exists!")
            logger.info("Non existing user tried to update its information: " + user_id)
        }
    } catch(error) {
        response.status(500).json("User details cannot be accessed");
        logger.error("User details cannot be accessed by: " + request.user + " error: " + error.message);
      }
});

// GET ALL USERS
router.get("/", verifyTokenAndAdmin, async (request, response) => {
    const query = request.query.new;
    try {
        const users = query
        ? await User.find().sort({ user_id: -1 }).limit(100)
        : await User.find();
        response.status(200).json(users);
    } catch(error) {
        response.status(500).json("User details cannot be accessed");
        logger.error("User details cannot be accessed by: " + request.user.id + " error: " + error.message);
      }
});

// GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (request, response) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  
    try {
      const data = await User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
      response.status(200).json(data);
      logger.info("User stats accessed by: " + request.user.id)
    } catch (error) {
      response.status(500).json("User stats access denied!");
      logger.error("User stats access denied to: " + request.user.id + " error: " + error.message)
    }
  });

module.exports = router