const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender_index: {type: Number, default: -1},
    sender_name: String,
    content: String,
    key: String,
    timestamp: {type: Date, default: Date.now},
});

module.exports = mongoose.model("message", MessageSchema);