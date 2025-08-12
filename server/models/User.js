//user model to define user schema

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'username must be atleast 3 char long']
    },
    email:{
        type: String,
        required: [true, 'email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be atleast 6 char long']
    },

    currentSkills: [{
        type: String,
        trim: true,
    }],

    desiredRoles: [{
        type: String,
        trim: true,
    }],

    learningProgress: [{
        skillId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        status: {
            type: String,
            enum: ['pending', 'learning', 'completed', 'mastered'],
            default: 'pending'
        },

        dateUpdated: {
            type: Date,
            default: Date.now
        }
    }]

}, {
    timestamps: true
});


const User = mongoose.model('User', userSchema)
export default User