var express = require("express");
var router = express.Router({mergeParams: true});
const Stadium = require("../models/stadium");
var Comment = require("../models/comment");
var middleware = require("../middleware");

let { checkCommentOwnership, isLoggedIn, isPaid } = require("../middleware");
router.use(isLoggedIn, isPaid);



//Comments new
router.get("/new", isLoggedIn, function(req, res){
	//find stadium by id
	Stadium.findById(req.params.id, function(err, stadium){
		if(err){
			console.log(err);
		} else{
			res.render("comments/new", {stadium: stadium});
		}
	});
});



// //COMMENTS CREATE
router.post("/", isLoggedIn, function(req, res){
	//lookup stadium by id
	Stadium.findById(req.params.id, function(err, stadium){
		if(err){
			console.log(err);
			res.redirect("/stadiums");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {
					//add user name and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					stadium.comments.push(comment);
					stadium.save();
					//console.log(comment);
					req.flash("success", "Comment added successfully");
					res.redirect("/stadiums/" + stadium._id);
				}
			})
		}
	});
});




//Comments New
// router.get("/new",middleware.isLoggedIn, function(req, res){
//     // find stadium by id
//     console.log(req.params.slug);
//     Stadium.findOne({slug: req.params.slug}, function(err, stadium){
//         if(err){
//             console.log(err);
//         } else {
//              res.render("comments/new", {stadium: stadium});
//         }
//     })
// });


//EDIT ROUTE
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {stadium_id: req.params.id, comment: foundComment});
		}
	})
});




//COMMENT UPDATE
router.put("/:comment_id", checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Comment updated");
			res.redirect("/stadiums/" + req.params.id);
		}
	});
});




//COMMENTS DESTROY ROUTE
router.delete("/:comment_id", checkCommentOwnership, function(req, res){
	//find by id and remove
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment deleted");
			res.redirect("/stadiums/" + req.params.id);
		}
	});
});




module.exports = router;