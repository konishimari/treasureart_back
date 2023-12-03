const AppError = require("../utils/appError");
const handleCastErrorDB = (err) => {
  //MongooseのCastErrorを処理する関数
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  //MongooseのDuplicateFieldsDBを処理する関数
  console.log(err); // このログが出るか確認
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //MongooseのValidationErrorを処理する関数
  const errors = Object.values(err.errors).map((el) => el.message); //err.errorsはオブジェクトなので、Object.values()で配列に変換
  const message = `Invalid input data. ${errors.join(". ")}`; //配列の各要素をドットで結合
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  //開発環境でのエラーハンドリング
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message, //err.messageはエラーのメッセージを返す
    stack: err.stack, //エラーのスタックトレースを返す
  });
};

const sendErrorProd = (err, res) => {
  //本番環境でのエラーハンドリング
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or other unknown error: don't leak error details
  } else {
    //1) Log error
    console.error("ERROR", err);

    //2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  //エラーハンドリングミドルウェア
  err.statusCode = err.statusCode || 500; //err.statusCodeが存在しない場合、500を代入
  err.status = err.status || "error"; //err.statusが存在しない場合、errorを代入

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    // error.message = error.message;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    console.log("Before if block: ", error.code); // ここで error.code を確認
    if (error.code === 11000) {
      console.log("Inside if block"); // このログが出るか確認
      error = handleDuplicateFieldsDB(error);
    }
    console.log("After if block"); // このログが出る
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
