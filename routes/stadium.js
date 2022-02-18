var express = require("express");
var router = express.Router();
var Stadium = require("../models/stadium");
// var middleware = require("../middleware");

let { checkStadiumOwnership, isLoggedIn, isPaid } = require("../middleware/index");
router.use(isLoggedIn, isPaid);


//INDEX - SHOW ALL STADIUMS
router.get("/", function(req, res){
    // if (req.query.paid) res.locals.success = 'Payment succeeded, welcome to StadRate!';
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery? pageQuery : 1;
    //get all stadiums from db
    Stadium.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).sort({likes: -1}).exec(function(err, allStadiums){
        Stadium.countDocuments().exec(function(err, count){
            if(err){
                console.log(err);
            } else{
                res.render("stadiums/index", {
                    stadiums: allStadiums,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                });
            }
        });
    });
});


//CREATE A NEW STADIUM AND SAVE TO DB
router.post("/", isLoggedIn, function(req, res){
    //get data from form and add to stadiums array
    var name = req.body.name;
    var price = req.body.price;
	var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newStadium = {name: name, price: price, image: image, description: desc, author: author}
    //create a new stadium and save to db
    Stadium.create(newStadium, function(err, newlyCreate){
        if(err){
            console.log(err);
        }else 
        //redirect back to stadiums page
        res.redirect("/stadiums");
        
    });
});


//NEW - SHOW FORM TO CREATE A NEW STADIUM
router.get("/new", isLoggedIn, function(req, res){
    res.render("stadiums/new");
});



// SHOW - shows more info about one Stadium
router.get("/:id", function(req, res){
    //find the Stadium with provided ID
	Stadium.findById(req.params.id).populate("comments likes").exec(function(err, foundStadium){
		if(err) {
			console.log(err);
		} else {
			//console.log(foundStadium);
			//render show template with that Stadium
			res.render("stadiums/show", {stadium: foundStadium});
		}
	});
});


// Stadium Like Route
router.post("/:id/like", isLoggedIn, function (req, res) {
    Stadium.findById(req.params.id, function (err, foundStadium) {
        if (err) {
            console.log(err);
            return res.redirect("/stadiums");
        }

        // check if req.user._id exists in foundStadium.likes
        var foundUserLike = foundStadium.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundStadium.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundStadium.likes.push(req.user);
        }
        foundStadium.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/stadiums");
            }
            return res.redirect("/stadiums/" + foundStadium._id);
        });
    });
});


//EDIT STADIUM ROUTE
router.get("/:id/edit", checkStadiumOwnership, function(req, res){
    Stadium.findById(req.params.id, function(err, foundStadium){
        res.render("stadiums/edit", {stadium: foundStadium});
    });
});




//UPDATE STADIUM ROUTE
router.put("/:id", checkStadiumOwnership, function(req, res){
    //find and update the correct stadium
    Stadium.findByIdAndUpdate(req.params.id, req.body.stadium, function(err, updatedStadium){
        if(err){
            res.redirect("/stadiums");
        } else{
            //redircet to show page
            res.redirect("/stadiums/" + req.params.id);
        }
    });
});




//DELETE/DESTROY STADIUM
router.delete("/:id", checkStadiumOwnership, async(req, res) => {
    try {
        let foundStadium = await Stadium.findById(req.params.id);
        await foundStadium.remove();
        res.redirect("/stadiums");
    } catch (error){
        console.log(error.message);
        res.redirect("/stadiums");
    }
});







module.exports= router;