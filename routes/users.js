const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');




router.get('/register' , (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async(req, res , next) => {
    try{
    const {email , username , password} = req.body;
    const user = new User({email, username});
    const newUser = await User.register(user, password);
    req.login(newUser, err => {
        if(err){
            return next(err);
        }
        else{
            req.flash('success', `Welcome to FindYourProperty!! ${username}`);
            res.redirect('/properties');
        }
    });
    }catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
    //console.log(newUser);
}));

router.get('/login', (req ,res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local',{failureFlash:true , failureRedirect: '/login'}),(req ,res) => {
    req.flash('success',`Welcome back!! ${req.body.username}`);
    const redirectUrl =  req.session.returnTo || '/properties';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req ,res )=>{
   // const username = req.body.username;
    //console.log(req.body)
    req.flash('success', `Goodbye!`)
    req.logout();
    res.redirect('/properties')
})
module.exports = router;