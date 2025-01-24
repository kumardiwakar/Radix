

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}
const dbUrl = process.env.ATLASDB_URL;
const User=require('./router/user.js');
const Tournaments=require('./router/tournaments.js');
const Team=require('./router/team.js');
const Match=require('./router/match.js');
const Live=require('./router/live.js');
const Review=require('./router/review.js');
const express = require('express')
const app = express()
const mongoose = require('mongoose');
const user=require('./Models/user.js');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const MongoStore = require('connect-mongo');
const session=require('express-session');
const flash=require('connect-flash');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: dbUrl,
    collectionName: 'sessions'
  }),
  cookie: {
    expires:Date.now()+1000*60*60*24*7,
    maxAge:1000*60*60*24*7,
    httpOnly:true
  }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(flash());

app.use((req, res,next) => {
 res.locals.successMessage= req.flash('success');
 res.locals.errorMessage= req.flash('error');
 res.locals.currentUser = req.user; // Pass the logged-in user to all views
  next();
});

app.use((req, res, next) => {
  res.locals.currentPath = req.path; // Makes the current path accessible in all views
  next();
});

app.use('/',User);
app.use('/',Tournaments);
app.use('/',Team);
app.use('/',Match);
app.use('/',Live);
app.use('/',Review);



main().catch(err => console.log(err));

async function main() {
  // await mongoose.connect('mongodb://127.0.0.1:27017/Kabaddi');
   await mongoose.connect(dbUrl);
  
}
app.listen(8080, () => {
    console.log(`Example app listening on port 8080`);
  });