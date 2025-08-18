//main server file
import mongoose from "mongoose";
import express from  'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from "./config/db.js";
import { driver as neo4jDriver } from "./config/neo4j.js";
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import analyzeRoutes from "./routes/analyzeRoutes.js"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

connectDB() //db connect


app.get('/', (req, res) => {
    res.send('backend is running')
})

//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes)

//error handling(middleware)
app.use((err, req, res,next) => {
    console.error(err.message)
    res.status(500).send('Something wrong')
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})


// process.on('SIGINT', async () => {
//     console.log('Shutting down server...');
//     await mongoose.disconnect();
//     await neo4jDriver.close();
//     console.log('Database connections closed. Server gracefully terminated.');
//     process.exit(0);
// });