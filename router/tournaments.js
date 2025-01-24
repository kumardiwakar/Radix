const express=require('express');
const router=express.Router();

const Tournament=require('../Models/newTournament.js')

const user=require('../Models/user.js');
const { isLoggedIn , saveOriginalUrl, checkLogin} = require('../middleware.js');
const mongoose = require('mongoose');

router.get('/tournament/form', isLoggedIn,(req,res)=>{
  res.render("tournamentForm.ejs");
})
router.post('/tournament/signup',isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const user1 = await user.findById(userId);
    const { tournamentName, location, startDate, endDate, description } = req.body;

    const match = new Tournament({
      tournamentName,
      location,
      description,
      startDate,
      endDate,
      organiserId:userId,
      
    });
    const savedMatch = await match.save();
    user1.TournamentId.push(savedMatch._id);
    user1.save();
    // Pass the formatted savedMatch to the view
  return res.redirect('/tournaments/view');
  } catch (err) {
    res.status(500).send("Something went wrong!");
  }
});

router.get('/tournaments/view', async (req, res) => {
  try {
    // Fetch tournaments and populate organiser details
    const tournaments = await Tournament.find().populate({
      path: 'organiserId',
      model:'User',
      select: 'fullName', // Only include fullName in organiser details
    });
    // Pass tournaments and logged-in user's ID to the template
   return res.render('showTournament.ejs', {
      tournaments,
      userId: req.user ? req.user._id : null, // Pass logged-in user's ID
    });
    // res.send(tournaments)
  } catch (err) {
    console.log(err);
    res.status(500).send('An error occurred');
  }
});

router.get('/tournament/:id/detail/view', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate tournament ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid Tournament ID');
    }

    // Fetch tournament and populate team details
    const tournament = await Tournament.findById(id).populate([{
      path: 'team', // Populate the 'team' field
      model: 'Team', // Reference the Team model
      select: 'teamName captainId players', // Include specific fields from Team
      populate: {
        path: 'captainId players', // Populate captainId and players within Team
        model: 'User', // Reference the User model
        select: 'username email fullName phoneNumber', // Include specific fields from User
      },
    },
    {
      path:'match',
      model:'Match',
      select:'teamA teamB winner totalPointA totalPointB createdAt matchType',
      populate: {
        path: 'teamA teamB', // Populate captainId and players within Team
        model: 'Team', // Reference the User model
        select: 'teamName', // Include specific fields from User
      },
    }
  ]);
    if(!tournament){
      req.flash('error',"No any Live Matches is Happening")
     return res.redirect('/');
    }
  return  res.render('tournamentDetail.ejs', {
      tournament,
      userId: req.user ? req.user._id : null, // Pass logged-in user's ID
    });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

router.get('/tournament/:id/edit',async (req,res)=>{
  let {id}=req.params;
  let tournament=await Tournament.findOne({_id:id})
  res.render('tournamentEdit.ejs',{tournament});
})
router.patch('/tournament/:id/edit', async (req, res) => {
  let { id } = req.params;
  let { tournamentName, location, description, startDate, endDate } = req.body;

  // Construct the update object dynamically
  let updateData = {
    tournamentName,
    location,
    description,
  };

  if (startDate) {
    updateData.startDate = startDate;
  }
  if (endDate) {
    updateData.endDate = endDate;
  }

  // Perform the update
  try {
    let editedTournament = await Tournament.findByIdAndUpdate(id, updateData, { new: true });
    res.redirect(`/tournaments/view`); // Redirect to the tournament details page (adjust as needed)
  } catch (error) {
    req.flash('error',error.message);
    res.redirect('/tournaments/view')
  }
});
  module.exports=router