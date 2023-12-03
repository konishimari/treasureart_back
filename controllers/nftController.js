const User = require("../models/userModel");
const Nft = require("../models/nftModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllNfts = factory.getAll(Nft);

exports.createNft = factory.createOne(Nft);

exports.updateLike = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const {tokenURI} = req.body;
  // use req.user.userId to get _id
  const userId = req.user.user_id;
  const nft = await Nft.findOne({tokenURI});
  console.log(nft);
  // addToSetは重複を許さない
  if (nft.likes.includes(userId)) {
    nft.likes.pull(userId); // pullは配列から要素を削除する
  } else {
    nft.likes.addToSet(userId);
  }
  await nft.save();
  res.status(200).json({
    status: "success",
    data: {
      data: nft,
    },
  });
}
);

