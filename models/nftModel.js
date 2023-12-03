const mongoose = require("mongoose");

const nftSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: [true, "Please provide your tokenId!"],
  },
  image: {
    type: String,
    required: [true, "Please provide your image!"],
  },
  owner: {
    type: String,
    ref: "User",
    required: [true, "Please provide your owner!"],
  },
  seller: {
    type: String,
    ref: "User",
    required: [true, "Please provide your seller!"],
  },
  price: {
    type: Number,
    required: [true, "Please provide your price!"],
  },
  name: {
    type: String,
    required: [true, "Please provide your name!"],
  },
  description: {
    type: String,
    required: [true, "Please provide your description!"],
  },
  tokenURI: {
    type: String,
    required: [true, "Please provide your tokenURI!"],
  },
  angle: {
    type: String,
    enum: ["square", "horizontal", "vertical"],
    default: "square",
  },
  tags: {
    type: Array,
  },
  likes: [
    {
      type: String,
      ref: "User",
    },
  ],
});

const Nft = mongoose.model("Nft", nftSchema);

module.exports = Nft;