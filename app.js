var indexRouter = require("./routes/api.js");
var viewsRouter = require("./routes/views.js");
const controller = require("./controller/files.js");
var createError = require("http-errors");
var express = require("express");
const request = require('request');
var path = require("path");
var mongoose = require("mongoose");
const http = require("http");
const logger = require("morgan");
var cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
var cors = require('cors')
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const User = require("./models/User.js");


var app = express();
app.use(cors())
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true,
//   defer: true
// }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.set('etag', false);//disable cache
app.use(cookieParser());


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   'Content-Type, Authorization, Content-Length, X-Requested-With'
  // );

  if (req.method === "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

const dotenv = require("dotenv");
dotenv.config();
app.get("/", (req, res, next) => {
  res.redirect("https://accounts.codes/files/login");
})
app.use(express.static(path.join(__dirname, "./build")));
// app.use("/uploads",express.static(path.join(__dirname,"/uploads")));
app.use(express.static(__dirname));



// app.use(controller.checkPermission);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(fileUpload({ createParentPath: true }));

leaderCheckPermission = async (req, res, next) => {
  console.log("in leaderCheckPermission")
  console.log(req.originalUrl)
  let userName = req.originalUrl.split("/")[1];
  let redirectUrl = req.get('host')
  let apiFlag = false
  let urlRoute
  if (userName == "api") {
    userName = req.originalUrl.split("/")[2];
    apiFlag = true
  }
  if (!apiFlag) urlRoute = req.originalUrl.split("/")[3]
  if (req.headers["authorization"] == "null" || !req.headers["authorization"]) {
    if (req.cookies && req.cookies.jwt) {
      req.headers["authorization"] = req.cookies.jwt
    }
    else {
      return res.status(401).json({ des: redirectUrl, routes: urlRoute, apiFlag: apiFlag, status: 401 })
    }
  }
  if (!userName || !req.headers["authorization"]) {
    {
      return res.status(401).json({ des: redirectUrl, routes: urlRoute, apiFlag: apiFlag, status: 401 })
    }

  } else {
    const options = {
      method: "GET",
      url: "https://accounts.codes/isPermission/" + userName,
      headers: { Authorization: req.headers["authorization"] },
    };
    request(options, (error, response, body) => {
      console.log("in req")
      if (error || response.statusCode != 200) {
        return res.status(401).json({ des: redirectUrl, routes: urlRoute, apiFlag: apiFlag, status: 401 })
      }
      else {

        if (body) {
          console.log("next")
          return next();

        }

        else {
          return res.status(401).json({ des: redirectUrl, routes: urlRoute, apiFlag: apiFlag, status: 401 })
        }

      }
    }
    );
  }
};
setJwtAfterLogin = async (req, res, next) => {
  if (req.query.jwt) {
    console.log("after login")
    let redirectUrl = 'https://' + req.get('host') + req.originalUrl.split("?")[0]
    console.log(redirectUrl)
    //יש לשנות את הדומיין לפי האפליקציה
    res.setHeader('Set-Cookie', `jwt=${req.query.jwt}; HttpOnly`, 'domain = files.codes');
    res.redirect(redirectUrl)
    res.end();
  }
  else
    next();
}

app.use("/api", leaderCheckPermission, indexRouter);
app.use("/", setJwtAfterLogin, viewsRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => console.log("connected to mongoose")
);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // res.render("error");
});

app.listen(3000, () => {
  console.log("listening to port 3000");
  schedule.scheduleJob('0 0 * * *', (date) => {
    controller.removeFile30dayAfterDeleted();
    console.log("date", new Date());
  }) // run everyday at midnight
});

module.exports = app;
