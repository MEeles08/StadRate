var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Stadium = require("../models/stadium");
var Comment = require("../models/comment");

const { isLoggedIn, isAdmin } = require('../middleware');
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




//ROOT ROUTE
router.get("/", function(req, res){
    res.render("landing");
});


//AUTHENTICATION ROUTES

//SHOW REGISTER FORM
router.get("/register", function(req, res){
    res.render("register");
});


//HANDLE SIGNUP LOGIC
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email});
    var passwordCount = req.body.password;
    var passwordCheck =  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,15}$/;
    if(!passwordCount.match(passwordCheck)){
        req.flash("error", "Password must contain 6 to 15 letters including a capital, number and a special character");
        res.redirect("register");
    } else {
        if(req.body.adminCode === "adminroleplease"){
            newUser.isAdmin = true;
            newUser.isPaid = true;
        }
        User.register(newUser, req.body.password, function(err, user){
            if(err){
                //console.log(err);
                req.flash("error", err.message);
                return res.redirect("register");
            } 
            passport.authenticate("local")(req, res, function(){
                res.redirect("/stadiums");
            });
        });
    }
});


//SHOW LOGIN FORM
router.get("/login", function(req, res){
    res.render("login");
});


//HANDLING LOGIN LOGIC
router.post("/login", passport.authenticate("local",
{
    successRedirect: "/stadiums",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Successful login, welcome to StadRate"
}), function(req, res){
});


//LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You have logged out safely");
    res.redirect("/");
});

//PROFILE PAGE 
router.get("/profile/:id", isLoggedIn, function(req, res){
    //bring up user page
    //list all of users stadiums
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User not found");
            res.redirect("/");
        }
        Stadium.find().where("author.id").equals(foundUser._id).exec(function(err, stadiums){
            if(err){
                req.flash("error", "User does not own any stadiums");
                res.redirect("back");
            }
        Comment.find().where("author._id").equals(foundUser._id).exec(function(err, comments){
            if(err){
                req.flash("error", "User does not own any comments");
                res.redirect("back");
            }
            res.render("profile",{user: foundUser, stadiums: stadiums, comments: comments});
            });
        });
    });
})



//GET UPDATE PROFILE
router.get('/profile/:id/update', isLoggedIn, function(req, res){
    //bring up update page
    //display users info
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User not found");
            res.redirect("/");
        }
        res.render("profile/update", {user: foundUser})
    });
})


//PUT UPDATE PROFILE ROUTE
router.put("/profile/:id/update", function(req, res){
    //find and update the correct stadium
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedProfile){
        if(err){
            req.flash("error", "Please log back in with new credentials");
            res.redirect("/login");
        } else{
            //redircet to show page
            req.flash('success', 'Successfully updated')
            res.redirect("/profile/" + req.params.id);
        }
    });
});


//DELETE A USER
router.delete("/profile/:id/delete", async(req, res) => {
    try {
        let foundUser = await User.findById(req.params.id);
        await foundUser.remove();
        req.flash('success', 'User successfully deleted');
        res.redirect("/stadiums");
    } catch (error){
        req.flash('error', error.message);
        console.log(error.message);
        res.redirect("/stadiums");
    }
});




//ADMIN ROUTE
router.get("/admin", isAdmin, function(req, res){
    //show all users
    User.find({}).exec(function(err, user){
        if(err){
            console.log(err)
        } else{
            res.render('admin', {users: user})
        }
    })
});







//GET checkout
// router.get('/checkout', isLoggedIn, (req, res) => {
//     if(req.user.isPaid){
//         req.flash('success', 'Your account is already paid');
//         return res.redirect('/stadcamps');
//     }
//     res.render('checkout', { amount: 20 });
// });

// // POST pay
// router.post('/pay', isLoggedIn, async (req, res) => {
//     const { paymentMethodId, items, currency } = req.body;

//     const amount = 2000;
  
//     try {
//       // Create new PaymentIntent with a PaymentMethod ID from the client.
//       const intent = await stripe.paymentIntents.create({
//         amount,
//         currency: 'usd',
//         payment_method: paymentMethodId,
//         error_on_requires_action: true,
//         confirm: true
//       });
  
//       console.log("💰 Payment received!");

//       req.user.isPaid = true;
//       await req.user.save();
//       // The payment is complete and the money has been moved
//       // You can add any post-payment code here (e.g. shipping, fulfillment, etc)
  
//       // Send the client secret to the client to use in the demo
//       res.send({ clientSecret: intent.client_secret });
//     } catch (e) {
//       // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
//       // See https://stripe.com/docs/declines/codes for more
//       if (e.code === "authentication_required") {
//         res.send({
//           error:
//             "This card requires authentication in order to proceeded. Please use a different card."
//         });
//       } else {
//         res.send({ error: e.message });
//       }
//     }
// });






module.exports = router;