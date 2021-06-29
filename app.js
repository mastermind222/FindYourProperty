if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const {campgroundSchema , reviewSchema} = require('./schemas.js');
const Joi = require('joi');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalPassport = require('passport-local');
const User = require ('./models/user');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true,
    useFindAndModify: false
})

const db= mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("DataBase Connected");
});


const app = express();


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname , 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisissecret';
/*const store = new MongoDBStore({
    url : dbUrl,
    secret,
    touchAfter : 24*3600
});*/

/*store.on("error" ,function(e){
    console.log("SESSION STORE ERROR", e)
})*/

const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly: true,
        //secure: true
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalPassport(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

 


app.use('/', userRoutes)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) =>{
    res.render('home')
});

app.all('*',(req,res,next) => {
     next(new ExpressError('Page Not Found', 404))
 })

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) message = 'Something Went Wrong';
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log(`LISTENING ON ${port} `)
})