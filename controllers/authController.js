const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");
const { promisify } = require("util");
const Web3 = require("web3");
const ethers = require("ethers");
const dotenv = require("dotenv");



// method for verifying jwt token
const verifyToken = promisify(jwt.verify);

// method for getting sign message
const getSignMessage = (address, nonce) => {
  return `I am signing my one-time nonce: ${nonce} to ${address}`;
}

// method for sign jwt token
const signToken = (nonce, address) => {
  return jwt.sign({ nonce, address }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

exports.checkUser = catchAsync(async (req, res, next) => {
  const { address } = req.body;
  // find user by address(user_id) and return boolean
  const user = await User.findOne({ user_id: address }); // user_id = address
  if (!user) {
    return res.status(200).json({
      status: 'success',
      data: {
        userExists: false,
      },
    });
  } else {
    return res.status(200).json({
      status: 'success',
      data: {
        userExists: true,
      },
    });
  }
});

// nonce for authentication
exports.getNonce = catchAsync(async (req, res, next) => {
  const { address } = req.body;
  if (!address) {
    return next(new AppError("Address is required", 400));
  }
  // find user by address(user_id)
  console.log(address);
  const user = await User.findOne({user_id: address}); // user_id = address
  // !user means user need to sign up
  if (!user) {
    return next(new AppError('you need to sign up', 400));
  }
  // create nonce
  const nonce = Math.floor(Math.random() * 1000000); 
  // create temp token
  const temptoken = signToken(nonce, address);
  // create message
  const message = getSignMessage(address, nonce);

  res.status(200).json({
    status: "success",
    message,
    temptoken,
  });
}
);

// verify jwt token
exports.verify = catchAsync(async (req, res, next) => {
  const { address, signature, message, temptoken } = req.body;
  if (!address || !signature || !temptoken) {
    return next(
      new AppError("Address, signature and temptoken are required", 400)
    );
  }
  // verify temptoken
  const decoded = await verifyToken(temptoken, process.env.JWT_SECRET);
  console.log(message);
  console.log(signature);
  // tolowercase
  if (decoded.address.toLowerCase() !== address.toLowerCase()) {
    return next(new AppError("Address is not matched", 400));
  }
  // find user by address(user_id)
  const user = await User.findOne({ user_id: decoded.address }); // user_id = address
  // !user means user need to sign up
  console.log(user);
  if (!user) {
    return next(new AppError("you need to sign up", 400));
  }
  // verify signature
  // const message = getSignMessage(address, decoded.nonce);

  const recovered = ethers.utils.verifyMessage(message, signature);
  console.log(recovered);
  console.log(address);
  if (recovered.toLowerCase().trim() !== address.toLowerCase().trim()) {
    return next(new AppError("Signature is not matched", 400));
  }
  // create token
  const token = signToken(decoded.nonce, address);
  res.status(200).json({
    status: "success",
    token,
  });
}
);

exports.protect = catchAsync(async (req, res, next) => {

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // console.log(req.headers.authorization);
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  // Verification token
  const decoded = await verifyToken(token, process.env.JWT_SECRET);

  // Check if user still exists
  const user = await User.findOne({ user_id: decoded.address }); // user_id = address
  if (!user) {
    return next(new AppError("The user belonging to this token does no longer exist.", 401));
  }


  // Grant access to protected route
  req.user = user;
  next();
}
);