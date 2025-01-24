const mongoose = require("mongoose");
const { Schema } = mongoose;


const tournamentSchema = new Schema({
    tournamentName: {
        type: String,
        trim: true,
        required: true
    },
    location: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    startDate: { 
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    organiserId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' ,
        required: true
    },
    team:[{
        type: Schema.Types.ObjectId, 
        ref: 'Team' ,
    }],
    match:[{
        type: Schema.Types.ObjectId, 
        ref: 'Match',
    }]
});


const Tournament = mongoose.model('Tournament', tournamentSchema);


module.exports = Tournament;
