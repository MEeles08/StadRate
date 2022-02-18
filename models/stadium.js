var mongoose = require("mongoose");

// SCHEMA SETUP
var stadiumSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	]
});






const Comment = require("./comment");
stadiumSchema.pre("remove", async function() {
	await Comment.deleteOne({
		_id: {
			$in: this.comments
		}
	});
});

module.exports = mongoose.model("Stadium", stadiumSchema);


