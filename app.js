require('dotenv').config();

var express 	= require("express"),
	app 		= express(),
 	bodyParser 	= require("body-parser"),
 	mongoose 	= require("mongoose"),
	passport	= require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	Stadium		= require("./models/stadium"),
	Comment 	= require("./models/comment"),
	User 		= require("./models/user"),
	flash 		= require("connect-flash")



//requiring routes
var commentRoutes 	= require("./routes/comments");
var	stadiumRoutes 	= require("./routes/stadium");
var	indexRoutes 	= require("./routes/index");


mongoose.connect("mongodb://localhost/stadium_view", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname +"/public"));
app.use(methodOverride("_method"));
app.use(flash());


//Get the default connection

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

//passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())),
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});




app.use("/", indexRoutes);
app.use("/stadiums/:id/comments", commentRoutes);
app.use("/stadiums", stadiumRoutes);




//tell express to listen for requests (start server)
app.listen(3000, function() {
	console.log('StadView app has started on port 3000. URL: http://localhost:3000/');
}); 