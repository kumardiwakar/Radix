const express=require('express');
const router=express.Router();
const mongoose = require('mongoose');
const Tournament=require('../Models/newTournament.js')
const Team=require('../Models/team.js');

const user=require('../Models/user.js');
router.get('/team/:id/add',(req,res)=>{
  let {id}=req.params
 res.render("team.ejs",{id});
})


router.post('/team/:id/add', async (req, res) => {
 try {
   const { id } = req.params; // Tournament ID
   const { teamName, captainUsername,} = req.body;

   // Validate the tournament ID
   if (!mongoose.Types.ObjectId.isValid(id)) {
     req.flash('error', 'Invalid tournament ID');
     return res.redirect(`/team/${id}/add`);
   }

   // Find the captain by username
   const captainData = await user.findOne({ username: captainUsername });
   if (!captainData) {
     req.flash('error', `${captainUsername} is not registered.`);
     return res.redirect(`/team/${id}/add`);
   }

   const tournament = await Tournament.findById(id).populate({
     path: 'team',
     model:'Team',
     select:'players'
   });
   console.log(tournament);
   if(captainData._id.toString()===tournament.organiserId._id.toString()){
     req.flash('error',`${captainUsername} is organiser of tournament`);
     return res.redirect(`/team/${id}/add`);
   }

  // Check if the user is in any of the teams
  for (const team of tournament.team) {
   if (team.players.some((player) => String(player._id) === String(captainData._id))) {
     req.flash('error', `${captainUsername} is already registerd in the tournament`);
     return res.redirect(`/team/${id}/add`);
   }
 } 

 //check whether team is already registered

   let checkTeam = await Team.findOne({
     $and: [
       { teamName: teamName },
       { tournamentId: new mongoose.Types.ObjectId(id) },
     ]
   });

   

   if(checkTeam){
     req.flash('error', `${teamName} is already registered in the tournament.`);
     return res.redirect(`/team/${id}/add`);
   }

   // Create a new team
   const newTeam = new Team({
     teamName,
     captainId: captainData._id,
     tournamentId: new mongoose.Types.ObjectId(id), // Convert id to ObjectId
   });

   newTeam.players.push(captainData._id);
   const savedTeam = await newTeam.save();

   // Add the team to the tournament
   tournament.team.push(savedTeam._id);
   await tournament.save();

   
   req.flash('success', 'Team added successfully!');
  return res.redirect(`/tournament/${id}/detail/view`);
 } catch (err) {
   req.flash('error', err.message);
   console.log(err);
   res.redirect(`/team/${req.params.id}/add`);
 }
});


router.post("/tournament/:tournamentId/team/:teamId/player/add",async (req,res)=>{
   let {tournamentId,teamId}=req.params;
   let {userName}=req.body;
   
   try{
     const playerDetail=await user.findOne({username:userName});
   if(!playerDetail){
     req.flash('error',`${userName} is not rgisterd`)
    return res.redirect(`/tournament/${tournamentId}/detail/view`)
   }


   const tournament = await Tournament.findById(tournamentId).populate({
     path: 'team',
     model:'Team',
     select:'players'
   });

   // Check if the user is in any of the teams
   for (const team of tournament.team) {
     if (team.players.some((player) => String(player._id) === String(playerDetail._id))) {
       req.flash('error', `${userName} is already registerd in the tournament`);
     return res.redirect(`/tournament/${tournamentId}/detail/view`)
     }
   }   
     const team=await Team.findOne({_id:teamId});
     team.players.push(playerDetail._id);
     team.save();
     req.flash('success', `${playerDetail.fullName} add sucessfully in the team ${team.teamName}`);
    return res.redirect(`/tournament/${tournamentId}/detail/view`)
   }
   catch(err){
     res.send(err);
   }
})

router.get('/player/:tournamentId/:teamId/:playerId/delete',async (req,res)=>{
 const { tournamentId,teamId, playerId } = req.params; // Assume `playerId` is passed as a route parameter.

try {
 // Find the team and remove the player from the players array
 const updatedTeam = await Team.findByIdAndUpdate(
   teamId, // The team ID
   { $pull: { players: playerId } }, // Remove the player ID from the players array
   { new: true } // Return the updated document
 );

 let player=await user.findById(playerId);
 let playerName=player.fullName;

 

 if (!updatedTeam) {
   req.flash('error', 'Team not found.');
   return res.redirect('/'); // Redirect to an appropriate route
 }

 req.flash('success', `${playerName} removed successfully from the team.`);
return  res.redirect(`/team/${teamId}/detail`);
} catch (err) {
 req.flash('error', 'An error occurred while removing the player.');
return res.redirect('/'); // Redirect to an appropriate route
}
})

router.get('/team/:id/detail', async (req, res) => {
 let { id } = req.params;

 let teamDetail = await Team.findById(id)
   .populate([
     {
       path: 'players',
       model: 'User',
       select: 'fullName prefferedPosition raidPoint taklePoint bonusPoint matchPlayed',
     },
     {
       path: 'tournamentId',
       model: 'Tournament',
       select: 'organiserId endDate', // Select organiserId for nested population
       populate: {
         path: 'organiserId', // Populate organiserId
         model: 'User', // Assuming organiserId references User
         select: 'fullName email', // Include fields from User
       },
     },
   ])
   .populate({
     path: 'captainId',
     model: 'User',
     select: 'fullName',
   });
 res.render('teamDetail.ejs', { teamDetail });
});
 module.exports=router;