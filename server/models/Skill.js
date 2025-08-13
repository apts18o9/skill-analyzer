import mongoose from 'mongoose'


const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'skill name is requried'],
        unique: true,
        trim: true,
    },

    description: {
        type: String,
        default: '',
    },

    category: {
        type: String,
        enum: ['frontend', 'backend', 'devops', 'cloud', 'mobile'],
        default: 'General'
    }
}, {
    timestamps: true,
});


// skillSchema.index({name: 1}) //for faster lookups

const Skill = mongoose.model('Skill', skillSchema)
export default Skill;
