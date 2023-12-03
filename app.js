const express = require("express");
const morgan = require("morgan");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const nftRouter = require("./routes/nftRoutes");
const authRouter = require("./routes/authRoutes");
const cors = require("cors");

const app = express();

app.use(express.json()); 
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); 
}

app.use(cors());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/users", userRouter); 
app.use("/api/v1/nfts", nftRouter);
app.use("/api/v1/auth", authRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); 
});

app.use(globalErrorHandler);

module.exports = app;