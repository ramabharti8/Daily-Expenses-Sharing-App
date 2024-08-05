import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import {apiResponse} from "../utils/apiResponse.js"


const generateAccessAndRefreshToken = async(userId)=>{
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      //save refresh  token in db

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave : false })

      return {accessToken , refreshToken}

   } 
   catch (error) {
      throw new apiError(500,"Something went wrong while generating Access and Refresh token")
   }
}

const registerUser = asyncHandler(async (req, res) => {
   //take data from frontend
   const {username,email,password} = req.body
  
   //check if user already exits in database 
   const existedUser =await User.findOne({
      $or: [
         { username },
         { email },
      ]
   })
   if (existedUser) {
      throw new apiError(409, "User with email or name already exists")
   }

   //store user in database

   const user = await User.create({
      username,
      email,
      password
   })
   // check if user is stored successfully in db and remove password and refresh Token
   const createdUser =await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if (!createdUser) {
      throw new apiError(500, "Something went wrong while registering a user")
   }

   //return response to frontend

   return res.status(201).json(
      new apiResponse(200,createdUser,"User registered successfully")
   )
}
)

const loginUser = asyncHandler(async(req,res)=>{

    //get user details from frontend

    const {email,password} = req.body

    //valiadate email and password

    if(!email || !password){
      throw new apiError(400,"Email and password are required")
    }

    //check if user already exits in db

    const user = await User.findOne({email})

    if(!user){
      throw new apiError(404,"User doesn't exists")
    }

    //verify password

    const isPasswordCorrect=await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
      throw new apiError(401,"Invalid user credentials")
    }

    //generate access token and refresh token for user

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    //send tokens in cookies
    
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )
    
    //setting options so that cookies can't be modified on frontend

    const options = {
       httpOnly : true,
       secure : true
    }

    //send response
    res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(
      new apiResponse(
         200,
         {
            user : loggedInUser,
            accessToken,
            refreshToken
         },
         "User logged In successfully"
      )
    )

    
})

const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
     req.user._id,
     {
        $set : {
          refreshToken: undefined
        }
     },
     {
       new: true
     }
   )
   const options = {
     httpOnly : true,
     secure : true
  }

  res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new apiResponse(
     200,
     {},
     "User logged out successfully"
    )
  )

})

const getUserDetails = asyncHandler(async (req,res)=>{
     
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if(!user){
      throw new apiError(404,"User not found")
    }
    res.status(200)
    .json(
      new apiResponse(200,user,"User details retreived successfully")
    )

})
export { registerUser,
   loginUser,
   logoutUser,
   getUserDetails
 }