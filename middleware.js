module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl
        req.flash('error','You must be logged in to access this page.');
       return res.redirect('/');
    }
    next();
}
 

module.exports.checkLogin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl
        req.flash('error','Password or username is wrong');
       return res.redirect('/');
    }
    next();
}