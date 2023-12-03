const express = require("express");
const nftController = require("../controllers/nftController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(authController.protect, nftController.getAllNfts);
router.route("/").post(authController.protect, nftController.createNft);

router
  .route("/updateLike")
  .patch(authController.protect, nftController.updateLike);


module.exports = router;