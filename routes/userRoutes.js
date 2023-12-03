const express = require("express");
const userController = require("../controllers/userController"); 
const authController = require("../controllers/authController");


const router = express.Router();

router.post(
  "/register",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.signup
);

router
  .route('/likes')
  .get(authController.protect, userController.getOneUserBySeller);
router.route("/:id/profile").get(userController.getUser);

module.exports = router;