const express=require('express');
const router=express.Router();
const multer  = require('multer')
const {storage}=require('../cloudConfig.js');
const Review=require('../Models/review.js');
const user=require('../Models/user.js');
const mongoose = require('mongoose');
const upload = multer({ storage })
const passport = require('passport');
const { checkLogin} = require('../middleware.js');
router.get('/', async(req, res)=> {
  let allReview=await Review.find().populate({
    path:'reviewer',
    model:'User',
    select:'fullName profile.url',
  });
  res.render('home.ejs',{allReview});
})

router.get('/signup', (req, res) => {
   res.render('userForm.ejs',); // Render the form view
});

router.post('/signup', upload.single('profileImage'), async (req, res) => {


  try {
      const { fullName, username, email, phoneNumber, password, conformpassword, country, state, city, prefferedPosition, gender, age } = req.body;

      // Check for password mismatch
      if (password != conformpassword) {
          req.flash('error', 'Password and conform password must be the same.');
          return res.redirect('/signup');
      }

      
      let profile;
      if (req.file) {
        profile = {
          url: req.file.path,
          filename: req.file.filename,
        };
      }
      console.log(req.file);
      // Create a new user instance
      const user1 = new user({
          profile,
          fullName,
          username,
          email,
          phoneNumber,
          prefferedPosition,
          age,
          gender,
          country,
          state,
          city,
      });

      // Register the user with Passport.js
      const registeredUser = await user.register(user1, password);
      req.login(registeredUser, (err) => {
          if (err) {
              req.flash('error', 'Something went wrong while logging you in.');
              return res.redirect('/');
          }
          req.flash('success', 'Registered Successfully and Logged In!');
          return res.redirect('/'); // Redirect to the user page
      });
  } catch (err) {

      // Handle specific duplicate username error
      if (err.name === 'UserExistsError') {
          req.flash('error', 'Username already exists. Please choose another username.');
      } else {
          req.flash('error', err.message || 'Something went wrong during registration.');
      }

      return res.redirect('/signup');
  }
});
router.get('/login',checkLogin,(req,res)=>{
  res.redirect('/');
})

router.post('/login', 
  passport.authenticate('local',
     {
     failureRedirect: '/login' ,
     failureFlash: true
    }),
 async function(req, res) {
    req.flash('success','Welcome back!')
    let {username}=req.body;
    let user1=await user.findOne({username:username});
    res.redirect(`/user/${user1._id}/detail`);
  }
);


router.get('/user/:id/detail',async (req,res)=>{
    let {id}=req.params;//User id
    const userMatches = await user.findById(new mongoose.Types.ObjectId(id))
    .populate([{
      path: 'matchPlayedId', // Path for Match references
      model: 'Match',
      select: 'teamA teamB tournamentId winner totalPointA totalPointB matchType', // Select only specific fields from Match
      populate: [
        { path: 'teamA', model: 'Team', select: 'teamName' }, // Populate teamA
        { path: 'teamB', model: 'Team', select: 'teamName' }, // Populate teamB
        { path: 'tournamentId', model: 'Tournament', select: 'tournamentName' }, // Populate tournamentId
      ],
    },
    {
      path:'TournamentId',
      model:'Tournament',
      select:'tournamentName location description startDate endDate organiserId '
    }
  ]);
     res.render('userDetail.ejs',{userMatches});
})




router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Handle potential errors
    }
    req.flash('success', 'You have been logged out successfully.');
    res.redirect('/'); // Redirect to the homepage or login page
  });
});

router.get('/user/:id/edit', async (req,res)=>{
  let {id}=req.params; //User Id
  let data=await user.findById(id);
  res.render('userEdit',{data})
})
router.patch('/user/:id/edit', async (req, res) => {
  const { id } = req.params;//User Id
  try {
    const { currentPassword, newPassword, fullName, username, email, phoneNumber, country, state, city, prefferedPosition, gender, age } = req.body;

    // Fetch the user by ID
    const userToEdit = await user.findById(id);
    
    // Verify the current password
    const isPasswordValid = await userToEdit.authenticate(currentPassword);
    if (!isPasswordValid.user) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect(`/user/${id}/edit`);
    }

    // If a new password is provided, update it
    if (newPassword && newPassword.trim() !== "") {
      await userToEdit.setPassword(newPassword);
    }

    // Update other fields
    userToEdit.fullName = fullName;
    userToEdit.username = username;
    userToEdit.email = email;
    userToEdit.phoneNumber = phoneNumber;
    userToEdit.country = country;
    userToEdit.state = state;
    userToEdit.city = city;
    userToEdit.prefferedPosition = prefferedPosition;
    userToEdit.gender = gender;
    userToEdit.age = age;

    // Save the updated user
    await userToEdit.save();
    
    let user1=await user.findById(id);
    req.flash('success', 'Profile updated successfully');
  return  res.redirect(`/user/${id}/detail`);
  } catch (err) {
    console.log(err)
    req.flash('error', 'Something went wrong while updating the profile');
   return res.redirect(`/user/${id}/edit`);
  }
});
  module.exports=router;