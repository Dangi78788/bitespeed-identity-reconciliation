const express = require("express");
const { identifyContact } = require("../controllers/identifyController");

const router = express.Router();
router.post("/identify", identifyContact);

module.exports = router;
