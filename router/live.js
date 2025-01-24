const express=require('express');
const router=express.Router();
const mongoose = require('mongoose');
const Match=require('../Models/match.js');
const user=require('../Models/user.js');
router.get('/live', async (req, res) => {
  try {
    const matches = await Match.find().populate([
      {
        path: 'teamA',
        model: 'Team',
        select: 'teamName',
      },
      {
        path: 'teamB',
        model: 'Team',
        select: 'teamName',
      },
      {
        path: 'tournamentId',
        model: 'Tournament',
        select: 'tournamentName location startDate endDate',
      },
    ]);
  if(matches.length===0){
    req.flash('error','No any Live match is there');
  return res.redirect('/');
  }
    res.render('live.ejs', { matches });
  } catch (err) {
    res.status(500).send('An error occurred while fetching live matches.');
  }
});
router.get('/match/:id/detail/live',async (req,res)=>{
  let {id}=req.params;
  let match=await Match.findById(id)
  .populate([
    {
      path: 'teamA',
      model: 'Team',
      select: 'teamName',
    },
    {
      path: 'teamB',
      model: 'Team',
      select: 'teamName',
    },
    {
      path: 'tournamentId',
      model: 'Tournament',
      select: 'tournamentName organiserId',
    },
  ]);
  
  let raidPointA=0;
  let raidPointB=0
  let taklePointA=0;
  let taklePointB=0;
  let bonusPointA=0;
  let bonusPointB=0;

  for(point of match.teamAPlayer){
    raidPointA+=point.raidPoint;
    taklePointA+=point.taklePoint;
    bonusPointA+=point.bonusPoint;
  }
  
  for(point of match.teamBPlayer){
    raidPointB+=point.raidPoint;
    taklePointB+=point.taklePoint;
    bonusPointB+=point.bonusPoint
  }
      res.render('liveDetail.ejs',{match,raidPointA,raidPointB,taklePointA,taklePointB,bonusPointB,bonusPointA});
        // res.send(match);
})
router.get('/plus1/:matchId/:teamId/:teamName/:playerId/:positionPoint', async (req, res) => {
  let { teamId, teamName, playerId, positionPoint, matchId } = req.params;

  

  let match = await Match.findOne({ _id: new mongoose.Types.ObjectId(matchId) });

  if (teamName === 'teamAPoint') {
    
    if(positionPoint==='allOutPointsA'){
      match.allOutPointsA+=2;
      match.totalPointA+=2;
      await match.save();
     return res.redirect(`/match/${matchId}/detail/live`);
    }else if(positionPoint==='extraPointsA'){
      match.extraPointsA+=1;
      match.totalPointA+=1;
      await match.save();
     return res.redirect(`/match/${matchId}/detail/live`);
    }

    // Find the player in team A
    let player = match.teamAPlayer.find(obj => obj.id.toString() === playerId);
    if (player) {
      let p=await user.findOne({ _id: new mongoose.Types.ObjectId(playerId) });
      if(positionPoint.toString()==='raidPoint')p.raidPoint+=1;
      else if(positionPoint.toString()==='taklePoint')p.taklePoint+=1;
      else p.bonusPoint+=1;
      player[positionPoint] += 1;
      p.save();
      match.totalPointA+=1;
    } else {
      console.log("Player not found in teamA");
    }
  } else {

    if(positionPoint==='allOutPointsB'){
      match.allOutPointsB+=2;
      match.totalPointB+=2;
      await match.save();
     return res.redirect(`/match/${matchId}/detail/live`);
    }else if(positionPoint==='extraPointsB'){
      match.extraPointsB+=1;
      match.totalPointB+=1;
      await match.save();
     return res.redirect(`/match/${matchId}/detail/live`);
    }
    

    // Find the player in team B
    let player = match.teamBPlayer.find(obj => obj.id.toString() === playerId);
    if (player) {
      let p=await user.findOne({ _id: new mongoose.Types.ObjectId(playerId) });
      
      if(positionPoint.toString()==='raidPoint')p.raidPoint+=1;
      else if(positionPoint.toString()==='taklePoint')p.taklePoint+=1;
      else p.bonusPoint+=1;
      player[positionPoint] += 1;
      p.save();
      match.totalPointB+=1;
    } else {
      console.log("Player not found in teamB");
    }
  }

  await match.save();
  res.redirect(`/match/${matchId}/detail/live`);
});
  module.exports=router

//   app.use('/',User);
//   app.use('/',match);
//   app.use('/',tournament);
//   app.use('/',team);
//   app.use('/',review);
//   app.use('/',live);

// const User=require('./router/user.js');
// const match=require('./router/user.js');
// const tournament=require('./router/tournaments.js');
// const team=require('./router/team.js');
// const live=require('./router/live.js');
// const review=require('./router/review.js');