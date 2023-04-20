const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const verifyToken = async (request, response, next) => {
    const authHeader = request.headers.token;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        console.log(token);
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
            if(error){
                logger.error("user token is not valid!");
                response.status(403).json("Token is not valid!");
            } else{
                request.user = user;
                next();
            }
        });
    } else {
        logger.error("User authentication failed!");
        return response.status(400).json("Authentication failed!");
    }
};

const verifyTokenAndAuthorization = (request, response, next) => {
    verifyToken(request, response, ()=>{
        if(request.user.id === request.params.user_id || request.user.isAdmin){
            next();
        } else {
            response.status(403).json("You are not allowed to do that!");
            logger.info("Unauthorized user: " + request.user.id);
        }
    })
};

const verifyTokenAndAdmin = (request, response, next) => {
    verifyToken(request, response, ()=>{
        if(request.user.isAdmin){
            next();
        } else {
            response.status(403).json("You are not allowed to do that!");
            logger.info("Unauthorized Admin: " + request.user.id);
        }
    })
};

module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin };