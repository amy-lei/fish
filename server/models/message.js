const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender_name: String,
    content: String,
    key: String,
    timestamp: {type: Date, default: Date.now},
});

module.exports = mongoose.model("message", MessageSchema);