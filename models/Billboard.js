const mongoose = require("mongoose");

// Declaring schemas

const BillboardSchema = new mongoose.Schema(
    {
        billboard_id: {type: String, required: true},
        billboard_owner_id: {type: String, required: true},
        latitude: {type: String, required: true},
        longitude: {type: String, required: true},
        address: {type: String, required: true},
        land_type: {type: String, required: true},
        governing_body: {type: String, required: true},
        billboard_type: {type: String, required: true},
        height: {type: String, required: true},
        width: {type: String, required: true},
        billboard_image: {type: String, required: true},
    },
    { timestamps: true }
);

// Creating models
Billboard = mongoose.model("Billboard", BillboardSchema);

// Exporting all the models
module.exports = Billboard;