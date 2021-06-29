const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const {reviewSchema} = require('../schemas.js');

const validateReview = (req,res,next) =>{
    

    const{error} = reviewSchema.validate(req.body);
   
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

const isLoggedIn = (req, res , next) =>{
    if(!req.isAuthenticated()){
    req.flash('error', 'Login First! Redirected to Login Page')
    res.redirect('/login');
    }
    else{
       next();
    }
 }

 const isAuthor = async (req, res, next) => {
    const  id= req.params.id;
    const reviewId =req.params.reviewId;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
       req.flash('error',`You do not have the Permission to alter that comment !!`);
       res.redirect(`/properties/${id}`);
      }
      else{
         next();
      }
 }
 


router.post('/',isLoggedIn, validateReview, catchAsync(async (req,res,next)=>{
    const id = req.params.id;
    const campground= await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Review added Successfully!!!');
    res.redirect(`/properties/${campground._id}`);
 }));

 router.delete('/:reviewId' ,isLoggedIn,isAuthor, catchAsync(async (req,res,next) => {
    await Campground.findByIdAndUpdate(req.params.id, { $pull: {reviews: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success','Review deleted Successfully!!');
    res.redirect(`/properties/${req.params.id}`);
 }));


 module.exports =router;