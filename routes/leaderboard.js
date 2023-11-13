const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboard");

router.get("/premium/showleaderboard", leaderboardController.getLeaderboard);

module.exports = router;
