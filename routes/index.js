const express = require("express");
const router = express.Router();

router.use("/api/v1/auth", require("./auth/index"));
router.use("/api/v1/chat", require("./chat/index"));
router.use("/api/v1/topic", require("./topic/index"));
router.use("/api/v1/card", require("./card/index"));
router.use("/api/v1/horoscope", require("./horoscope/index"));
router.use("/api/v1/package", require("./package/index"));
router.use("/api/v1/bill", require("./bill/index"));

module.exports = router;
