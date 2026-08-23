import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        date: Date,
        location: String,
        capacity: Number,
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Event", eventSchema);