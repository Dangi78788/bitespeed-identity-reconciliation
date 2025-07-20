require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const identifyRoute = require("./routes/identifyRoute");

const app = express();
app.use(bodyParser.json());

app.use("/", identifyRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
