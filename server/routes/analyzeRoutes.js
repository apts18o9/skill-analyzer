//route for AI model to extract data and storing in neo4j and db

import express from "express"
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv"
import { protect } from "../middleware/authMiddleware.js"
import User from "../models/User.js";
import { driver } from "../config/neo4j.js";

dotenv.config()

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/text', protect, async (req, res) => {
    const { text } = req.body; //extract the text from user input
    const session = driver.session();

    if (!text) {
        return res.status(400).json({ message: 'Text is required for analysis' });
    }

    try {
        const prompt = `
            You are a career and skill gap analysis tool. Your task is to extract a list of skills and job roles from the following text.
            Format your response as a JSON object with two keys: "skills" and "roles". The value for each key should be a list of strings.
            Example of expected JSON format:
            {
              "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
              "roles": ["Frontend Developer", "Backend Developer"]
            }
            Do not include any additional text or explanation in your response. The output must be a valid JSON object.            
            Text to analyze:
            "${text}"
        `;

        const result = await model.generateContent(prompt);
        let content = result.response.text();

        // Remove Markdown code block if present (handles extra whitespace/newlines)
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = content.match(codeBlockRegex);
        if (match) {
            content = match[1].trim();
        }

        const parsedResult = JSON.parse(content);

        //adding the roles and skills to neo4j and mongodb
        const { skills, roles } = parsedResult;

        //updating transactions in neo4j(nodes)
        await session.executeWrite(async (tx) => {
            // MERGE or create Skill nodes and link to the user
            for (const skillName of skills) {
                const query = `
                    MATCH (u:User {mongodb_id: $userId})
                    MERGE (s:Skill {name: $skillName})
                    MERGE (u)-[:HAS_SKILL]->(s)
                    RETURN s
                `;
                await tx.run(query, { userId: req.user._id.toString(), skillName });
                console.log(`- Created or found skill: ${skillName}`);
            }

            // MERGE or create Role nodes and link to the user(neo4j cypher queries)
            for (const roleName of roles) {
                const query = `
                    MATCH (u:User {mongodb_id: $userId})
                    MERGE (r:Role {name: $roleName})
                    MERGE (u)-[:DESIRES_ROLE]->(r)
                    RETURN r
                `;
                await tx.run(query, { userId: req.user._id.toString(), roleName });
                console.log(`- Created or found role: ${roleName}`);
            }
        });

        //updating user in mongodb
        const user = await User.findById(req.user._id);
        user.currentSkills = skills;
        user.desiredRoles = roles;
        await user.save();

        console.log('Database sync done');

        res.status(200).json(parsedResult);

    } catch (error) {
        console.error('GeminiAPI error', error.message);
        res.status(500).json({ message: 'Error during text analysis', error: error.message })

    } finally {
        await session.close();
    }
});

export default router;