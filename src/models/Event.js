const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    location: String,
    capacity: Number
}, {
    timestamps: true
});