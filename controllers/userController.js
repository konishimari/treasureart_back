const User = require("../models/userModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");

const multerStorage = multer.memoryStorage(); // when you image processing before saving to disk, you should use memoryStorage() instead of diskStorage() because you can access to the image as buffer in memoryStorage() but you can't in diskStorage() file name is not get set in memoryStorage() so you should set file name in resizeUserPhoto middleware

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    // 画像のみをアップロードするようにする
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("profile_image"); // 画像をアップロードするときは、upload.single('profile_image')を追加する'profile_image'はフロント側で指定した名前 これでreq.fileに画像の情報が入る

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next(); // 画像がない場合は次のミドルウェアに移動する
  console.log(req.data);
  req.file.filename = `user-${req.body.name}-${Date.now()}.jpeg`; // 画像の名前を決める
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`${__dirname}/../public/img/users/${req.file.filename}`);  //toFile()はファイルを保存する この時、req.file.bufferは画像のデータを含んでいる 画像のデータをリサイズして、jpeg形式に変換して、qualityを90%にして、ファイルを保存する
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.signup = catchAsync(async (req, res, next) => {
  let user_id
  if (req.body.user_id) {
    user_id = req.body.user_id
  } else {
    return next(new AppError( "please sign up with metamask", 400))
  }
  // compare user_id with database user_id and if it is not in database, create new user
  const user = await User.findOne({ user_id: user_id }); 

  if (user) {
    return next(new AppError( "you already have an account", 400))
  } else {
  const filteredBody = filterObj(req.body);
  if (req.file && req.file.filename) filteredBody.profile_image = req.file.filename;
 
  req.body = { ...req.body, ...filteredBody };
  const newUser = await User.create({
    user_id,
    name: req.body.name,
    bio: req.body.bio,
    content: req.body.content,
    profile_image: req.body.profile_image,
  });
  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
}
}
);



// get one user with nfts where the user_id is in likes array use handlerFactory.getOne() with popOptions
exports.getOneUser = factory.getOne(User, {
  path: 'likes',
});
exports.getUser = factory.getOne(User);

exports.getOneUserBySeller = catchAsync(async (req, res, next) => {
      const userId = req.user._id;
      console.log(userId);

      let query = User.findById(userId); 
      query = query.populate(
        'likes',
      );   
      const doc = await query;

  const sellers = await Promise.all(
    doc.likes.map(async (like) => {
      const seller = await User.findOne({ user_id: like.seller });
      return seller;
    })
  );
  console.log(sellers);
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
      sellers,
    },
  });
}
);

