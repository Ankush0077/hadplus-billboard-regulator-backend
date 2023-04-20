const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const billboardRoute = require("./routes/billboard");
// const jobFormRoute = require("./routes/jobForm");
// const investorFormRoute = require("./routes/investorForm");
// const newsLetterFormRoute = require("./routes/newsLetterForm");
const logger = require("./config/logger");

dotenv.config();

mongoose.set('strictQuery', false);
const uri = process.env.MONGO_URL;
const client = mongoose.connect(uri,
                                {
                                    useNewUrlParser: true,
                                    useUnifiedTopology: true,
                                })
                                .then(()=>{
        logger.info("Connected with database...");})
        .catch((error)=>{
        logger.error(error);
    });

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.json());
app.use(require('cors')());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/billboard", billboardRoute)
// app.use("/api/job_form", jobFormRoute);
// app.use("/api/investor_form", investorFormRoute);
// app.use("/api/news_letter_form", newsLetterFormRoute);

const port = process.env.PORT;
app.listen(port || 5000, () => {
    logger.info("Server has started...");
})