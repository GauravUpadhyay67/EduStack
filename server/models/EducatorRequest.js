import mongoose from "mongoose";

const educatorRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const EducatorRequest = mongoose.model("EducatorRequest", educatorRequestSchema);

export default EducatorRequest;
