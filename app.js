if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app  = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');  
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

const userRoutes = require('./routes/users.js')
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';


async function main() {
  await mongoose.connect(dbUrl);
}

main().catch(err => console.log(err));

app.engine('ejs', ejsMate)  
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize())

const secret = process.env.SECRET || 'hahaha';

const store = new MongoStore({
    
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600
})

store.on("error", function(e){
    console.log("Session store error", e)
})


const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secret: true, 
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user; 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
  
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
    
app.get('/' , (req,res)=>{
    res.render('home.ejs')
})

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page not found', 404))
})

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh No, Something went wrong!"
    res.status(statusCode).render('error.ejs', {err});
})


const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`App is listening on port ${port}!`)
})
