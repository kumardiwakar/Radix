const mongoose = require('mongoose');
let {Schema}=mongoose;
const passportLocalMongoose = require('passport-local-mongoose');
// Define the user schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true, // Removes extra whitespace
  },
  email: {
    type: String,
    required: true,
    lowercase: true, // Converts email to lowercase
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  prefferedPosition: {
    type: String,
    enum: ['Raider', 'Defender', 'All-Rounder'], // Restricts to predefined values
  },
  
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  country:{
    type:String,
  },
  state:{
    type:String,
  },
  city:{
    type:String,
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
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  },
  TournamentId:[{
    type: Schema.Types.ObjectId,
        ref: 'Tournament'
  }],
  matchPlayedId:[{
    type: Schema.Types.ObjectId,
        ref: 'Match'
  }],
  matchPlayed:{
    type:Number,
    default:0
  },
  profile:{
    url:{
      type:String,
      default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF9tv_lbLgavX2LAvrjXPOTzOrXzBQY9Bbng&s"
    },
    filename:String,
  },
  reviewId:{
    type:  Schema.Types.ObjectId,
        ref: 'Review'
  }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;
