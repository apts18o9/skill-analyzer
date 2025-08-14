//verify JWT sent by client to ensure user is authenticated to protected routes


import jwt from "jsonwebtoken";
import User from "../models/User.js"
import dotenv from "dotenv"


dotenv.config();

const protect = async (req, res, next) => {
    let token;

    //check if authorization start with 'Bearer' token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            
            //get token from header
            token = req.headers.authorization.split(' ')[1];

            const verify = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(verify.id).select('-password');

            next(); //proceed to next route/middleware

        } catch (error) {
            console.error('Not authorized, token fail', error.message);
            return res.status(401).json({message: 'Not authorized, token fail'})
            
        }
    }

    if(!token){
        return res.status(401).json({message: 'Not authorzied, no valid token'})
    }
}

export {protect}