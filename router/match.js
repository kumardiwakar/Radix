const express    = require('express');
const router     = express.Router();
const Tournament = require('../Models/newTournament.js');
const Team       = require('../Models/team.js');
const Match      = require('../Models/match.js');
const user       = require('../Models/user.js');

router.get('/match/:id', (req, res) => {
  const { id } = req.params;
  res.render('match', { id });
});

router.post('/match/:id', async (req, res) => {
  const { teamA, teamB, matchType } = req.body;
  const { id } = req.params; // Tournament ID

  if (teamA === teamB) {
    req.flash('error', `Both teams can't be the same.`);
    return res.redirect(`/match/${id}`);
  }

  const team1 = await Team.findOne({ teamName: teamA, tournamentId: id }).populate({
    path: 'players', model: 'User', select: 'fullName raidPoint taklePoint'
  });
  const team2 = await Team.findOne({ teamName: teamB, tournamentId: id }).populate({
    path: 'players', model: 'User', select: 'fullName raidPoint taklePoint'
  });

  if (!team1) { req.flash('error', `${teamA} is not registered`); return res.redirect(`/match/${id}`); }
  if (!team2) { req.flash('error', `${teamB} is not registered`); return res.redirect(`/match/${id}`); }
  if (team1.players.length < 7) { req.flash('error', `${team1.teamName} has fewer than 7 players!`); return res.redirect(`/tournament/${id}/detail/view`); }
  if (team2.players.length < 7) { req.flash('error', `${team2.teamName} has fewer than 7 players!`); return res.redirect(`/tournament/${id}/detail/view`); }

  const match = new Match({ matchType, tournamentId: id, teamA: team1._id, teamB: team2._id });

  for (const player of team1.players) {
    match.teamAPlayer.push({ id: player._id, fullName: player.fullName });
  }
  for (const player of team2.players) {
    match.teamBPlayer.push({ id: player._id, fullName: player.fullName });
  }

  const newMatch = await match.save();

  for (const player of team1.players) {
    await user.findByIdAndUpdate(player._id, { $push: { matchPlayedId: newMatch._id }, $inc: { matchPlayed: 1 } });
  }
  for (const player of team2.players) {
    await user.findByIdAndUpdate(player._id, { $push: { matchPlayedId: newMatch._id }, $inc: { matchPlayed: 1 } });
  }

  const tournament = await Tournament.findById(id);
  tournament.match.push(newMatch._id);
  await tournament.save();

  res.redirect('/live');
});

// ── Finish match & notify all viewers ──
router.get('/result/:matchId/:teamA/:teamB/:scoreA/:scoreB', async (req, res) => {
  const { matchId, teamA, teamB } = req.params;
  const scoreA = Number(req.params.scoreA);
  const scoreB = Number(req.params.scoreB);

  const match = await Match.findById(matchId);
  const diff  = Math.abs(scoreA - scoreB);

  if      (scoreA > scoreB) match.winner = `${teamA} won by ${diff} points`;
  else if (scoreA < scoreB) match.winner = `${teamB} won by ${diff} points`;
  else                      match.winner = `Match is a tie`;

  await match.save();

  // Notify all viewers that the match is finished
  const io = req.app.get('io');
  if (io) {
    io.to(matchId.toString()).emit('matchFinished', { winner: match.winner });
  }

  res.redirect('/live');
});

module.exports = router;
