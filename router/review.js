const express=require('express');
const router=express.Router();
const Review=require('../Models/review.js');
const user=require('../Models/user.js');
router.get( '/review/:id',(req,res)=>{
  let {id}=req.params //Users Id
  res.render('review.ejs',{id});
})
router.post('/review/:id',async (req,res)=>{
  let {id}=req.params;
  let {review}=req.body;
  try{
    let reviewer=await user.findOne({_id:id});
    if(reviewer.reviewId){
      req.flash("error","You can give only one review");
      return res.redirect('/');
    }
  let newReview=new Review({review,reviewer:id});
   await newReview.save();
  
    let updateUser=await user.findByIdAndUpdate(id,{reviewId:newReview._id});
    await updateUser.save();
    req.flash("success","Your review posted successfully");
      return res.redirect('/');
  res.redirect('/');
  }
  catch(err){
    req.flash('error',err.message);
    res.redirect(`/review/${id}`);
  }
})
router.get('/review/:id/edit',async (req,res)=>{
  let {id}=req.params;
  let oldReview=await Review.findOne({_id:id});

  res.render('reviewEdit.ejs',{oldReview});
})
router.patch('/review/:id/edit',async (req,res)=>{
  let {id}=req.params;
  let {review}=req.body;
  let newReview=await Review.findByIdAndUpdate(id,{review});
  await newReview.save();
  req.flash('success','Review update successFully');
  res.redirect('/');
})
  module.exports=router;