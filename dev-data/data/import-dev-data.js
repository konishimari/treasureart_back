const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Nft = require("../../models/nftModel");
const User = require("../../models/userModel");

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

  const users = JSON.parse(fs.readFileSync(`${__dirname}/test_users.json`, "utf-8"));
  const nfts = JSON.parse(fs.readFileSync(`${__dirname}/test_nfts.json`, "utf-8"));

  const importData = async () => {
    try {
      await User.create(users, { validateBeforeSave: false });
      await Nft.create(nfts, { validateBeforeSave: false });
      console.log("Data successfully loaded!");
    } catch (err) {
      console.log(err);
    }
    process.exit();
  }

  const deleteData = async () => {
    try {
      await User.deleteMany();
      await Nft.deleteMany();
      console.log("Data successfully deleted!");
    } catch (err) {
      console.log(err);
    }
    process.exit();
  }

  if (process.argv[2] === "--import") {
    importData();
  } else if (process.argv[2] === "--delete") {
    deleteData();
  }

  console.log(process.argv);