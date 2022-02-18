var Stadium = require("../models/stadium");
var Comment = require("../models/comment");
const user = require("../models/user");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkStadiumOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Stadium.findById(req.params.id, function(err, foundStadium){
           if(err){
			   req.flash("error", "Stadium not found");
               res.redirect("back");
           }  else {
			// check if foundStadium exists, and if it doesn't to throw an error via connect-flash and send us back to the homepage
            if (!foundStadium) {
                    //req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
               // does user own the stadium?
            if(foundStadium.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
				req.flash("error", "You do not have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
				req.flash("error", "You dont have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}


//check if user has logged in
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
		//req.flash("error", "You need to be logged in to do that");
        return next();
    }
	req.flash("error", "Please login first!");
    res.redirect("/login");
}

//check if user is an admin
middlewareObj.isAdmin = function(req, res, next){
    if(req.isAuthenticated() && req.user.isAdmin){
        return next();
    } else {
        req.flash("error", "You need to be an Admin to do that!");
        res.redirect("/stadiums");
    }
}

//check if user has paid
middlewareObj.isPaid = function(req, res, next){
    if(req.user.isPaid) return next();
    req.flash("error", "Please pay registration fee before continuing");
    res.redirect("/checkout");
}


module.exports = middlewareObj;