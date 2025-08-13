//user reg and login

import express from "express"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { getNeo4jSession } from "../config/neo4j.js"
import bcrypt from "bcrypt"

dotenv.config();

const router = express.Router()

//to generate jwt

const generateJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '2d',
    })
}


//ROUTE to register a user

router.post('/register', async (req, res) => {

    const { username, email, password } = req.body

    console.log('Received a POST request to /api/auth/register');
    console.log('Request Body:', req.body);


    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Enter all fields' })
    }

    let session;


    try {

        //user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: "user already exists" });
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create user in db
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        if (user) {
            //neo4j integration
            session = getNeo4jSession();
            const cypherQuery = `
                CREATE (:User {mongodb_id: $mongodbId, email: $email})
                RETURN 'User node created in Neo4j' AS status
                `;

            const params = {
                mongodbId: user._id.toString(),
                email: user.email
            }

            await session.run(cypherQuery, params);

            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateJWT(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' })
        }

    } catch (error) {
        console.error('Error during user registration', error.message);
        return res.status(500).json({ message: 'Server error during registration' })

    }
    finally {
        if (session) {
            await session.close() //neo4j close
        }
    }


})

//ROUTE to login

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Enter all fields' })
    }
    console.log('Received a POST request to /api/auth/login');
    console.log('Request Body:', req.body);

    try {

        //check if user exists
        const user = await User.findOne({ email })

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateJWT(user._id),
            }, { message: "login success" })
        } else {
            res.status(401).json({ message: 'Invalid Credentials' })
        }

    } catch (error) {
        console.error('Error during login', error);
        return res.status(500).json({ message: 'Server error during login' });

    }
})


export default router