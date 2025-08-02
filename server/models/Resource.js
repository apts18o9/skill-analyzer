import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        required: [true, 'Resource URL is required'],
        trim: true,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, 'Please enter a valid URL'] // Basic URL validation
    },
    type: {
        type: String,
        enum: ['Course', 'Article', 'Book', 'Video', 'Documentation', 'Project', 'Other'],
        default: 'Article'
    },
    associatedSkills: [{
      
        type: String, // e.g., ['JavaScript', 'React']
        trim: true
    }],
   
}, {
    timestamps: true 
});

//indexes that will queried frequently 

resourceSchema.index({title: 'text', description: 'text'});
resourceSchema.index({associatedSkills: 1})

const Resource = mongoose.model('Resource', resourceSchema)
export default Resource;