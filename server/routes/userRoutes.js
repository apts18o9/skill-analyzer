import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { driver } from '../config/neo4j.js';

const router = express.Router();

router.put('/profile', protect, async (req, res) => {

    const { currentSkills, desiredRoles } = req.body;
    let session;

    try {
        // Find user in MongoDB
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Data cleaning and validation
        let validatedCurrentSkills = [];
        if (currentSkills && Array.isArray(currentSkills)) {
            validatedCurrentSkills = currentSkills.map(s => String(s).trim()).filter(Boolean);
        }

        let validatedDesiredRoles = [];
        if (desiredRoles && Array.isArray(desiredRoles)) {
            validatedDesiredRoles = desiredRoles.map(r => String(r).trim()).filter(Boolean);
        }

        // Update user in MongoDB
        user.currentSkills = validatedCurrentSkills;
        user.desiredRoles = validatedDesiredRoles;
        await user.save();

        // --- Neo4j Synchronization ---
        session = driver.session();
        const neo4jUserId = user._id.toString();

        await session.executeWrite(async (tx) => {
            // Delete all existing HAS_SKILL and DESIRES_ROLE relationships for the user in Neo4j
            const deleteQuery = `
                MATCH (u:User {mongodb_id: $neo4jUserId})-[r:HAS_SKILL|DESIRES_ROLE]->()
                DELETE r
            `;
            await tx.run(deleteQuery, { neo4jUserId });
            console.log(`Deleted old relationships for user ${neo4jUserId} in Neo4j.`);

            // Create new HAS_SKILL relationships
            if (validatedCurrentSkills.length > 0) {
                const createSkillsQuery = `
                    MATCH (u:User {mongodb_id: $neo4jUserId})
                    UNWIND $skills AS skillName
                    MERGE (s:Skill {name: skillName})
                    MERGE (u)-[:HAS_SKILL]->(s)
                `;
                await tx.run(createSkillsQuery, { neo4jUserId, skills: validatedCurrentSkills });
                console.log(`Created new HAS_SKILL relationships for user ${neo4jUserId}.`);
            }

            // Create new DESIRES_ROLE relationships
            if (validatedDesiredRoles.length > 0) {
                const createRolesQuery = `
                    MATCH (u:User {mongodb_id: $neo4jUserId})
                    UNWIND $roles AS roleName
                    MERGE (r:Role {name: roleName})
                    MERGE (u)-[:DESIRES_ROLE]->(r)
                `;
                await tx.run(createRolesQuery, { neo4jUserId, roles: validatedDesiredRoles });
                console.log(`Created new DESIRES_ROLE relationships for user ${neo4jUserId}.`);
            }
        });
        // --- Neo4j Synchronization End ---

        // Send a success response
        res.status(200).json({
            message: 'Profile updated',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                currentSkills: user.currentSkills,
                desiredRoles: user.desiredRoles
            }
        });

    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    } finally {
        if (session) {
            await session.close();
        }
    }
});

export default router;






// router.get('/profile', protect, async (req, res) => {
//   //req.user populated by protect
//   res.json({
//     _id: req.user._id,
//     username: req.user.username,
//     email: req.user.email,
//     currentSkills: req.user.currentSkills,
//     desiredRoles: req.user.desiredRoles,
//     // learningProgress: req.user.learningProgress
//   });
// });