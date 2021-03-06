var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	firstname: String,
	lastname: String,
	email: String,
	password: String,
	isAdmin: {type: Boolean, default: false},
	isPaid: {type: Boolean, default: true},
	description: String
}, {
	timestamps: { currentAt: new Date("<YYYY-mm-dd>") }
});

UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", UserSchema);