const catchAsync =   require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // use protect middleware to get user_id
    const userId = req.user.user_id;
    console.log(userId);
    // add owner and seller to req.body
    req.body.owner = "0xcd60f93430a45ce43f9f21c247ee906bb36ba1c0";
    req.body.seller = userId;
    console.log(req.body);

    const doc = await Model.create(req.body);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // use protect middleware to get _id
    const userId = req.user._id;
    console.log(userId);
    // find user by userId and populate likes array
    let query = Model.findById(userId); //populateは参照先のドキュメントを取得する
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    console.log(doc);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.userId) filter = { owner: req.params.userId };
  if (req.params.userId) filter = { seller: req.params.userId };

  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort("-_id")
    .limitFields()
    .paginate();
  const doc = await features.query; 
  // const doc = await features.query.explain(); //explain()はクエリの実行計画を表示する

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
}
);
  
