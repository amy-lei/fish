const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    key: String,
    players: [{
        name: String,
        index: Number,
    }],
    hands: [[
        {
            rank: String,
            suit: String,
        }
    ]],
});

module.exports = mongoose.model("game", GameSchema);
