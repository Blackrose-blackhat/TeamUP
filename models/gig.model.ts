import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
    text:
    {
        type:String,
        required:true
    },
    tags:{
        type :String,
        required:true
    },
    author:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    parentId:{
        type:String
    },
    children:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Gigs'
        }
    ],
    appliedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
    ],
});

const Gigs = mongoose.models.Gigs || mongoose.model('Gigs' , gigSchema);
export default Gigs;