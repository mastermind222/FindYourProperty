const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas.js');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder= mbxGeocoding({accessToken: mapBoxToken});



const validateCampground = (req,res,next) =>{
    

   const{error} = campgroundSchema.validate(req.body);
  
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
   req.session.returnTo = req.originalUrl
   req.flash('error', 'Login First! Redirected to Login Page')
   res.redirect('/login');
   }
   else{
      next();
   }
}

const isAuthor = async (req, res, next) => {
   const id =req.params.id;
   const campground = await Campground.findById(id);
   if(!campground.author.equals(req.user._id)){
      req.flash('error',`You do not have the Permission to alter ${campground.title} !!`);
      res.redirect(`/properties/${id}`);
     }
     else{
        next();
     }
}

router.get('/' , catchAsync(async (req, res , next) => {
    const campgrounds = await Campground.find({});
    res.render('properties/index', {campgrounds})
 }));
 
 
 router.get('/new', isLoggedIn, (req,res)=>{
      res.render('properties/new');
    
    });
 
 
 router.post('/',isLoggedIn, upload.array('image'),validateCampground,catchAsync(async (req,res, next)=>{
      const geoData = await geocoder.forwardGeocode({
         query: `${req.body.campground.address} ${req.body.campground.location}`,
         limit:1
      }).send()
      const campground =  new Campground(req.body.campground);
      campground.geometry = geoData.body.features[0].geometry;
      campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
      campground.author = req.user._id;
      const date = new Date(Date.now());
      campground.time = date.getTime();
      await campground.save();
      // // console.log(campground);
      req.flash('success','Property added Successfully!!');
      res.redirect(`/properties/${campground._id}`)
      //   res.send("UPLOADED")
     
  }));
 
 
 
 router.get('/:id' , catchAsync(async (req, res , next) => {
     const id =req.params.id;
     const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate:{
           path: 'author'
        }
      }).populate('author');
       const date = new Date(Date.now());
       const diffTime = parseInt((date.getTime()- campground.time)/(1000 * 3600 * 24));
     if(campground){
     res.render('properties/show',{campground , diffTime});
     }
     else{
      req.flash('error','Property doesnot Exists!!');
      res.redirect('/properties');
     }
  }));
 
  router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req,res , next) =>{
     const id =req.params.id;
     const campground = await Campground.findById(id);
     if(!campground){
      req.flash('error','Property doesnot Exists!!');
      res.redirect('/properties');
      }
      
      else{
         res.render('properties/edit',{campground});
      }
     
  }));
 
  router.put('/:id' ,isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(async (req,res , next) =>{
      const geoData = await geocoder.forwardGeocode({
         query: `${req.body.campground.address} ${req.body.campground.location}`,
         limit:1
       }).send()
      const id =req.params.id;
      const campground= await Campground.findByIdAndUpdate(id,{...req.body.campground});
      campground.geometry = geoData.body.features[0].geometry;
      const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
      campground.images.push(...imgs);
      const date = new Date(Date.now());
      campground.time = date.getTime();
      await campground.save();
      if(req.body.deleteImages){
         for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
         }
         await campground.updateOne({ $pull: { images: { filename: { $in : req.body.deleteImages}  } } })
      }
      req.flash('success','Property updated Successfully!!');
      res.redirect(`/properties/${campground._id}`)
     
     
  }));
 
  router.delete('/:id' , isLoggedIn, isAuthor, catchAsync(async (req,res,next) =>{
      const id =req.params.id;
      const campground = await Campground.findById(id);
      const images = campground.images;
      if(images.length){
         for(let image of images){
            await cloudinary.uploader.destroy(image.filename);
         }
      }
      await Campground.findByIdAndDelete(id);
      req.flash('success','Property deleted Successfully!!');
      res.redirect('/properties');
     
     
  }));


module.exports=router;