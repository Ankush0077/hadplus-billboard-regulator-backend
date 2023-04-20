const router = require("express").Router();

const billboard = require("../models/Billboard")
const logger = require("../config/logger");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

// Add Billboard
router.post("/add_billboard", verifyToken, async (request, response) => {
    try {
        logger.info(request.body.billboard_image);
        current_time = Date.now();
        const billboardID = `HADPLUSBBX${request.user.id}X${current_time}`;

        const newBillboard = new billboard(
            {
                billboard_id: billboardID,
                billboard_owner_id: request.user.id,
                latitude: request.body.latitude,
                longitude: request.body.longitude,
                address: request.body.address,
                land_type: request.body.land_type,
                governing_body: request.body.governing_body,
                billboard_type: request.body.billboard_type,
                height: request.body.height,
                width: request.body.width,
                billboard_image: request.body.billboard_image,
            }
        );
            
        const savedBillboard = await newBillboard.save();
        logger.info("New Billboard Added" + savedBillboard);
        response.status(201).json(`Billboard added to the server. The Billboard Id is ${billboardID}`);
    } catch (error) {
        response.status(500).json("Could not add the billboard.");
        logger.error("Adding Billboard Failed: " + error.message);
        }
});

// DELETE FORM
router.delete("/delete_billboard", verifyToken, async (request, response) => {
    try{
        const billboard_id= request.body.billboard_id
        try {
            const Billboard = await billboard.findOne({
                billboard_id: billboard_id,
            });
            if(Billboard){
                const deletedbillboard = await billboard.findByIdAndDelete(Billboard.id);
                logger.info("Billboard deletion initiated: " + billboard_id + "\nBillboard Details:\n"+ JSON.stringify(deletedbillboard));
                response.status(200).json("Billboard has been deleted");
                logger.info("Billboard has been deleted: " + billboard_id);
            } else{
                response.status(500).json("No such Billboard exists!")
                logger.info("Non existing Billboard tried to update its information: " + billboard_id)
            }
        } catch(error) {
            response.status(500).json("Cannot delete Billboard");
            logger.error("Cannot delete Billboard: " + billboard_id + " error: " + error.message);
        }
    } catch(error) {
        response.status(500).json("Cannot delete Billboard");
        logger.error("Cannot delete Billboard: " + " error: " + error.message);
    }
});

// GET FORM
router.get("/find/:billboard_id", verifyToken, async (request, response) => {
    billboardID = request.params.billboard_id;
    try {
        const Billboard = await billboard.findOne({
            billboard_id: billboardID,
        });
        if(Billboard){
            const getbillboard = await billboard.findById(billboard.id);
            logger.info("Billboard details Requested: " + billboardID + "\nBillboard Details:\n"+ JSON.stringify(getbillboard));
            response.status(200).json(getbillboard);
        } else{
            response.status(500).json("No such Billboard exists!")
            logger.info("Tried to get non existing Billboard: " + billboardID)
        }
    } catch(error) {
        response.status(500).json("Billboard details cannot be accessed");
        logger.error("Billboard details cannot be accessed by: " + request.user.id + " error: " + error.message);
      }
});

// GET ALL FORMS
router.get("/", verifyToken, async (request, response) => {
    isRegulator = request.user.isRegulator;
    const query = request.query.new;
    try {
        if(isRegulator){
            const billboards = query
                ? await billboard.findAll({governing_body: request.user.name}).sort({ billboard_id: -1 }).limit(100)
                : await billboard.find({governing_body: request.user.name});
            logger.info("Billboards details sent to: " + request.user.id);
            response.status(200).json(billboards);
        }else {
            const billboards = query
                ? await billboard.find({billboard_owner_id: request.user.id}).sort({ billboard_id: -1 }).limit(100)
                : await billboard.find({billboard_owner_id: request.user.id});
            logger.info("Billboards details sent to: " + request.user.id);
            response.status(200).json(billboards);
        }
    } catch(error) {
        response.status(500).json("Billboard details cannot be accessed");
        logger.error("Billboard details cannot be accessed by: " + request.user.id + " error: " + error.message);
    }
});

module.exports = router