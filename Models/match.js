const mongoose = require('mongoose');
let {Schema}=mongoose;
const matchSchema=new Schema({
    tournamentId:{
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
        required:true,
    },
    teamA:{
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required:true,
    },
    teamB:{
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required:true,
    },
    extraPointsA:{
        type:Number,
        default:0
    },
    extraPointsB:{
        type:Number,
        default:0
    },
    allOutPointsA:{
        type:Number,
        default:0
    },
    allOutPointsB:{
        type:Number,
        default:0
    },
    totalPointA:{
        type:Number,
        default:0
    },
    totalPointB:{
        type:Number,
        default:0
    },
    winner:{
        type:String,
        default:'Panding'
    },
    matchType:{
        type:String,
        required:'true'
    },
    //Team A player's Detail 
    teamAPlayer:[{
        id:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        fullName:{
            type:String
        },
        raidPoint:{
            type:Number,
            default:0
        },
        taklePoint:{
            type:Number,
            default:0
        },
        bonusPoint:{
            type:Number,
            default:0
        }
    }],
    //Team B players Detail
    teamBPlayer:[{
        id:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        fullName:{
            type:String
        },
        raidPoint:{
            type:Number,
            default:0
        },
        taklePoint:{
            type:Number,
            default:0
        },
        bonusPoint:{
            type:Number,
            default:0
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the current date and time
    },
})
const Match=mongoose.model('Match',matchSchema);
module.exports=Match;