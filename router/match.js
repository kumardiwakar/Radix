const express=require('express');
const router=express.Router();
const Tournament=require('../Models/newTournament.js')
const Team=require('../Models/team.js');
const Match=require('../Models/match.js');
const user=require('../Models/user.js');
router.get('/match/:id',(req,res)=>{
  let {id}=req.params
  res.render('match',{id});
})
router.post('/match/:id',async (req,res)=>{
  let {teamA,teamB,matchType}=req.body;
  let {id}=req.params;//Tournament Id
  if(teamA===teamB){
    req.flash('error',`Both team can't be same.`);
    return res.redirect(`/match/${id}`);
  }
  
  let team1=await Team.findOne({teamName:teamA ,tournamentId:id}).populate({
    path:'players',
    model:'User',
    select:'fullName raidPoint taklePoint'
  })
    
  let team2=await Team.findOne({teamName:teamB ,tournamentId:id}).populate({
    path:'players',
    model:'User',
    select:'fullName raidPoint taklePoint'
  })
  if(!team1){
    req.flash('error',`${teamA} is not registerd`);
    return res.redirect(`/match/${id}`);
  }
  if(!team2){
    req.flash('error',`${teamB} is not registerd`);
    return res.redirect(`/match/${id}`);
  }
  if(team1.players.length<7){
    req.flash('error',`${team1.teamName} has less than 7 players !`)
    return res.redirect(`/tournament/${id}/detail/view`)
  }
  if( team2.players.length<7){
    req.flash('error',`${team2.teamName} has less than 7 players !`)
    return res.redirect(`/tournament/${id}/detail/view`)
  }

  let match=new Match({
    matchType,
    tournamentId:id,
    teamA:team1._id,
    teamB:team2._id
  })

  

  for(player of team1.players){
    match.teamAPlayer.push({
      id:player._id,
      fullName:player.fullName

    })
  }

    for(player of team2.players){
      match.teamBPlayer.push({
        id:player._id,
        fullName:player.fullName
      })
  }

  
  let newmatch=await match.save();

  for(player of team1.players){
    await user.findByIdAndUpdate(player._id, {
      $push: { matchPlayedId: newmatch._id },
      $inc: { matchPlayed: 1 } // Increment matchPlayed by 1
    });
   
  }

  for(player of team2.players){
    await user.findByIdAndUpdate(player._id, {
      $push: { matchPlayedId: newmatch._id },
      $inc: { matchPlayed: 1 } // Increment matchPlayed by 1
    });
   }
   
  let updateTournaent=await Tournament.findById(id);
  updateTournaent.match.push(newmatch._id)
  await updateTournaent.save();
  
   res.redirect('/live');
})
router.get('/result/:matchId/:teamA/:teamB/:scoreA/:scoreB',async (req,res)=>{
  let {matchId,teamA,teamB,scoreA,scoreB} =req.params
    // Convert scoreA and scoreB to numbers
    scoreA = Number(scoreA);
    scoreB = Number(scoreB);
  let match=await Match.findById(matchId);
  let finalScore=Math.abs(scoreA-scoreB);
  if(scoreA>scoreB){match.winner=`${teamA} won by ${finalScore} points`}
  else if(scoreA<scoreB){match.winner=`${teamB} won by ${finalScore} points`}
  else {match.winner=`Match is tie`}
  match.save();
  res.redirect('/live')
})
  module.exports=router;