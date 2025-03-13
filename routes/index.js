const express = require("express");
const router = express.Router();

router.use("/api/v1/auth", require("./auth/index"));
router.use("/api/v1/chat", require("./chat/index"));
router.use("/api/v1/topic", require("./topic/index"));

module.exports = router;
