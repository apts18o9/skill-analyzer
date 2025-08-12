//user profile route

import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { getNeo4jSession } from "../config/neo4j.js"
import User from "../models/User.js"
import Skill from "../models/Skill.js"

const router = express.Router()


//ROUTE to get profile 

router.get('/profile', protect, async (req, res) => {
    //req.user populated by protect
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email :req.user.email,
        currentSkills: req.user.currentSkills,
        desiredRoles: req.user.desiredRoles,
        // learningProgress: req.user.learningProgress
    })
});


//to update user profile

router.put('/profile', protect, async (req, res) => {
    const {currentSkills, desiredRoles} = req.body;
    let session

    try {

        //find user in db
        const user = await User.findById(req.user._id);

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        //data cleaning 

        let validatedCurrentSkills = [];
        if(currentSkills && Array.isArray(currentSkills)){
            validatedCurrentSkills = currentSkills.map(s => String(s).trim()).filter(boolean) //clean
        }

        let validatedDesiredRoles = [];
        if (desiredRoles && Array.isArray(desiredRoles)) {
            validatedDesiredRoles = desiredRoles.map(r => String(r).trim()).filter(Boolean); // Simple clean
        }

        //update user in db
        user.currentSkills = validatedCurrentSkills;
        user.desiredRoles = validatedDesiredRoles;
        await user.save()

        //neo4j synchronization
        
        session = getNeo4jSession();
        const neo4jUserId = user._id.toString();

        //Delete  existing HAS_SKILL and DESIRES_ROLE relationships for current user in Neo4j
        const deleteQuery = `
            MATCH (u:User {mongodb_id: $neo4jUserId})-[r:HAS_SKILL|DESIRES_ROLE]->()
            DELETE r
        `;
        await session.run(deleteQuery, { neo4jUserId });
        console.log(`Deleted old relationships for user ${neo4jUserId} in Neo4j.`);


        // HAS_SKILL relationships
        if (validatedCurrentSkills.length > 0) {
            const createSkillsQuery = `
                MATCH (u:User {mongodb_id: $neo4jUserId})
                UNWIND $skills AS skillName
                MATCH (s:Skill {name: skillName})
                MERGE (u)-[:HAS_SKILL]->(s)
            `;
          
            await session.run(createSkillsQuery, { neo4jUserId, skills: validatedCurrentSkills });
            console.log(`Created new HAS_SKILL relationships for user ${neo4jUserId}.`);
        }

        // new DESIRES_ROLE relationships
        if (validatedDesiredRoles.length > 0) {
            const createRolesQuery = `
                MATCH (u:User {mongodb_id: $neo4jUserId})
                UNWIND $roles AS roleName
                MATCH (r:Role {name: roleName})
                MERGE (u)-[:DESIRES_ROLE]->(r)
            `;
            
            await session.run(createRolesQuery, { neo4jUserId, roles: validatedDesiredRoles });
            console.log(`Created new DESIRES_ROLE relationships for user ${neo4jUserId}.`);
        }

        //neo4j sync end

        res.json({
            message: 'Profile updated',
            user: {
                _id:  user._id,
                username: user.username,
                email: user.email,
                currentSkills: user.currentSkills,
                desiredRoles: user.desiredRoles
            }
        })
    } catch (error) {
        console.error('Error updating user details', error);
        res.status(500).json({message: 'Server error while updating profile'})
    }
    finally{
        if(session){
            await session.close()
        }
    }
})

export default router