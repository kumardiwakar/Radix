
const mongoose = require('mongoose');
let {Schema}=mongoose;
const reviewSchema=new Schema({
    review:{
        type:String,
        require:true
    },
    reviewer:{
        type: Schema.Types.ObjectId,
        ref:'User'
    }
})
const Review=mongoose.model('Review',reviewSchema);
module.exports=Review;