const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    user_id: {
      type: String,
      unique: true,
      required: [true, "Please tell us your user_id!"],
    },
    profile_image: {
      type: String,
      default: "default.jpg",
      required: [true, "Please provide your profile_image!"],
    },
    bio: {
      type: String,
      required: [true, "Please provide your bio!"],
    },
    content: {
      type: String,
      required: [true, "Please provide your content!"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ユーザーが「いいね」したNFTのリストを取得するメソッド
userSchema.virtual("likes", {
  ref: "Nft",
  foreignField: "likes",
  localField: "user_id",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
