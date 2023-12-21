var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");

const upload =  require('./multer');  // Import the multer middleware setup

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET login page */
router.get("/login", (req, res, next) => {
  res.render("login", {error: req.flash("error")});
})

/* GET feed page */
router.get("/feed", (req, res, next) => {
  res.render("feed");
});

/* Handle file uploading, POST upload route */
router.post("/upload", isLoggedIn ,upload.single('file') , async(req, res, next) => {
  // Access the uploaded file details via req.file
  if(!req.file) {
    return res.status(404).send('No files were uploaded.')
  }

  // jo file upload hui hai usei save karo as a post and uska postid user ko doh and post ko userid dedo
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

/* GET profile page */
router.get("/profile", isLoggedIn , async(req,res,next) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts"); // pushing our uploaded file to be shown in profile page
  res.render("profile", {user});
});

/* POST register route */
router.post("/register", (req,res) => {

  const { username, email, fullname } = req.body; // effective way to write than below 5 line code 
  const userData = new userModel({ username, email, fullname });

  // const userData = new userModel({
  //   username: req.body.username,
  //   email: req.body.email,
  //   fullName: req.body.fullname
  // });

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect('/profile')
    })
  })
});

/* POST login route */
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,  // will show flash or error message if u enter wrong details while login
}), (req, res) => {   //if app crashed check here once and use normal function instead of arrow function
});

/* GET logout route */
router.get("/logout", (req,res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/* function isLoggedIn Middleware (to make protected routes) */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}


module.exports = router;




