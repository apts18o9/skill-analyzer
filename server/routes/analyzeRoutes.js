//route for Ai model to extract data 

import express from "express"
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv"
import { protect } from "../middleware/authMiddleware.js"

dotenv.config()

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms)); 
// }

//route to generate llm based answer
router.post('/text', protect, async (req, res) => {
    const { text } = req.body;

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

        // await sleep(2000);

        // const completion = await openai.chat.completions.create({
        //     model: 'gpt-3.5-turbo',
        //     messages: [{role: 'user', content: prompt}],
        //     response_format: {type: 'json_object'},
        //     temperature: 0
        // });

        const result = await model.generateContent(prompt);
        let content = result.response.text();

        // Remove Markdown code block if present (handles extra whitespace/newlines)
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = content.match(codeBlockRegex);
        if (match) {
            content = match[1].trim();
        }

        const parsedResult = JSON.parse(content);

        res.status(200).json(parsedResult);
        //return extracted skills and roles 

        res.status(200).json(parsedResult);

        //todo: add logic of synchronization to neo4j and db 

    } catch (error) {
        console.error('GeminiAPI error', error.message);
        res.status(500).json({ message: 'Error during text analysis', error: error.message })

    }
});

export default router;