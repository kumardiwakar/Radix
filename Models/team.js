const mongoose = require("mongoose");
const { Schema } = mongoose;

const teamSchema = new Schema({
    teamName: {
        type: String,
        required: true, 
        trim: true,
    },
    tournamentId: {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
        required:true
    },
    captainId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        require:true
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now, 
    },
});

// This will ensure unique team names only within the same tournament, not globally
teamSchema.index({ teamName: 1, tournamentId: 1 }, { unique: true }); // Compound index on teamName + tournamentId

const Team = mongoose.model('Team', teamSchema);
module.exports = Team; 
