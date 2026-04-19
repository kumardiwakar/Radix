const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const Match    = require('../Models/match.js');
const user     = require('../Models/user.js');

// ── Helper: build and emit the score payload ──
async function emitScore(req, matchId) {
  const io = req.app.get('io');
  if (!io) return;

  const m = await Match.findById(matchId);
  if (!m) return;

  // Recalculate totals from players
  let raidPointA = 0, taklePointA = 0, bonusPointA = 0;
  let raidPointB = 0, taklePointB = 0, bonusPointB = 0;

  for (const p of m.teamAPlayer) {
    raidPointA  += p.raidPoint;
    taklePointA += p.taklePoint;
    bonusPointA += p.bonusPoint;
  }
  for (const p of m.teamBPlayer) {
    raidPointB  += p.raidPoint;
    taklePointB += p.taklePoint;
    bonusPointB += p.bonusPoint;
  }

  const totalA = raidPointA + taklePointA + bonusPointA + m.allOutPointsA + m.extraPointsA;
  const totalB = raidPointB + taklePointB + bonusPointB + m.allOutPointsB + m.extraPointsB;

  io.to(matchId.toString()).emit('scoreUpdate', {
    totalA, totalB,
    raidPointA, taklePointA, bonusPointA,
    raidPointB, taklePointB, bonusPointB,
    allOutPointsA: m.allOutPointsA, extraPointsA: m.extraPointsA,
    allOutPointsB: m.allOutPointsB, extraPointsB: m.extraPointsB,
    teamAPlayer: m.teamAPlayer,
    teamBPlayer: m.teamBPlayer,
  });
}

// ── GET /live ──
router.get('/live', async (req, res) => {
  try {
    const matches = await Match.find().populate([
      { path: 'teamA',        model: 'Team',       select: 'teamName' },
      { path: 'teamB',        model: 'Team',       select: 'teamName' },
      { path: 'tournamentId', model: 'Tournament', select: 'tournamentName location startDate endDate' },
    ]);

    if (matches.length === 0) {
      req.flash('error', 'No live matches right now.');
      return res.redirect('/');
    }
    res.render('live.ejs', { matches });
  } catch (err) {
    res.status(500).send('An error occurred while fetching live matches.');
  }
});

// ── GET /match/:id/detail/live ──
router.get('/match/:id/detail/live', async (req, res) => {
  const { id } = req.params;
  const match = await Match.findById(id).populate([
    { path: 'teamA',        model: 'Team',       select: 'teamName' },
    { path: 'teamB',        model: 'Team',       select: 'teamName' },
    { path: 'tournamentId', model: 'Tournament', select: 'tournamentName organiserId' },
  ]);

  let raidPointA = 0, taklePointA = 0, bonusPointA = 0;
  let raidPointB = 0, taklePointB = 0, bonusPointB = 0;

  for (const p of match.teamAPlayer) {
    raidPointA  += p.raidPoint;
    taklePointA += p.taklePoint;
    bonusPointA += p.bonusPoint;
  }
  for (const p of match.teamBPlayer) {
    raidPointB  += p.raidPoint;
    taklePointB += p.taklePoint;
    bonusPointB += p.bonusPoint;
  }

  res.render('liveDetail.ejs', {
    match, raidPointA, raidPointB,
    taklePointA, taklePointB,
    bonusPointA, bonusPointB,
  });
});

// ── GET /plus1/:matchId/:teamId/:teamName/:playerId/:positionPoint ──
router.get('/plus1/:matchId/:teamId/:teamName/:playerId/:positionPoint', async (req, res) => {
  const { teamId, teamName, playerId, positionPoint, matchId } = req.params;

  const match = await Match.findOne({ _id: new mongoose.Types.ObjectId(matchId) });

  if (teamName === 'teamAPoint') {
    if (positionPoint === 'allOutPointsA') {
      match.allOutPointsA += 2;
      match.totalPointA   += 2;
      await match.save();
      await emitScore(req, matchId);
      return res.redirect(`/match/${matchId}/detail/live`);
    }
    if (positionPoint === 'extraPointsA') {
      match.extraPointsA += 1;
      match.totalPointA  += 1;
      await match.save();
      await emitScore(req, matchId);
      return res.redirect(`/match/${matchId}/detail/live`);
    }

    const player = match.teamAPlayer.find(obj => obj.id.toString() === playerId);
    if (player) {
      const p = await user.findOne({ _id: new mongoose.Types.ObjectId(playerId) });
      if (positionPoint === 'raidPoint')       p.raidPoint  += 1;
      else if (positionPoint === 'taklePoint') p.taklePoint += 1;
      else                                     p.bonusPoint += 1;
      player[positionPoint] += 1;
      match.totalPointA += 1;
      await p.save();
    }
  } else {
    if (positionPoint === 'allOutPointsB') {
      match.allOutPointsB += 2;
      match.totalPointB   += 2;
      await match.save();
      await emitScore(req, matchId);
      return res.redirect(`/match/${matchId}/detail/live`);
    }
    if (positionPoint === 'extraPointsB') {
      match.extraPointsB += 1;
      match.totalPointB  += 1;
      await match.save();
      await emitScore(req, matchId);
      return res.redirect(`/match/${matchId}/detail/live`);
    }

    const player = match.teamBPlayer.find(obj => obj.id.toString() === playerId);
    if (player) {
      const p = await user.findOne({ _id: new mongoose.Types.ObjectId(playerId) });
      if (positionPoint === 'raidPoint')       p.raidPoint  += 1;
      else if (positionPoint === 'taklePoint') p.taklePoint += 1;
      else                                     p.bonusPoint += 1;
      player[positionPoint] += 1;
      match.totalPointB += 1;
      await p.save();
    }
  }

  await match.save();
  await emitScore(req, matchId);
  res.redirect(`/match/${matchId}/detail/live`);
});

module.exports = router;
