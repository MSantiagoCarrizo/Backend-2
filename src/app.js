import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import passport from "passport";
import "./config/passport.config.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/api", routes);

app.use(errorHandler);

export default app;

