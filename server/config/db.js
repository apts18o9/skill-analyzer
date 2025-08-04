import mongoose from "mongoose";
import dotenv from "dotenv"


dotenv.config()

const connectDB = async () => {
    try {
        
        const mongoURI = process.env.DATABASE_URL;
        if(!mongoURI){
            console.error('MongoDB url not found');
            process.exit(1);
        }

        await mongoose.connect(mongoURI);

        console.log('MongoDB connected successfully');
        

    } catch (error) {
        console.error('MongoDB connection error', error.message);
        process.exit(1);
        
    }
}

export default connectDB