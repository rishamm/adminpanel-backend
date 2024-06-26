const router = require("express").Router();
const User = require("../models/User");
const {verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const CryptoJS = require("crypto-js")



//UPDATE


  router.put('/:id', async(req,res)=>{
    if(req.body.password){
        req.body.password= CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString()
    }
    try{
        const updatedUser = await User.findByIdAndUpdate(req.params.id,{
            $set: req.body},{
              new:true
            }
        );
        res.status(200).json(updatedUser);
    }catch(err){
     res.status(500).json(err)       
    }
    
    
    })


    //DELETE

    router.delete('/:id',async(req,res)=>{
          try{
                await User.findByIdAndDelete(req.params.id);
                res.status(200).json("user has been deleted");
          }catch(err){
             res.status(500).json(err);
          }

    })

    //GET USER

    router.get('/find',async(req,res)=>{
        try{
          
             const user = await User.findById(req.params.id);
             const {password , ...others}=user._doc;
             console.log(password,others);
             res.status(200).json(others)
        }catch(err){
           res.status(500).json(err);
        }

  })

      //GET ALL USERS

      router.get('/',async(req,res)=>{
             
        const query = req.query.new; 
             
        try{
             const users = query? await User.find({isAdmin:false}).sort({_id:-1}).limit(5).select('-password') : await User.find({isAdmin:false}).select('-password');
         
             res.status(200).json(users)
        }catch(err){
           res.status(500).json(err);
        }

  })

   // USER STATUS 
     router.get("/stats", async (req,res)=>{
  const date = new Date();
  const lastYear = new  Date(date.setFullYear(date.setFullYear() -1));
  try{
     
   const data = await User.aggregate([{
    $match:{createdAt:{$gte:lastYear}}
   },
  
   {  $project:{
     month:{$month:"$createdAt"}
   } },
   {$group:{
    _id:"$month",
    total:{$sum :1},
   }}
  
  ]);
   res.status(500).json(data)
  }catch(err) {
   res.status(500).json(err)


  } 
  
  
  });




module.exports =router;