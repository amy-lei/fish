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
    history: {type: [Object], default: []}, 
    whoseTurn: String,
    turnType: {type: String, default: "ask"},
    even: {type: Number, default: 0},
    odd: {type: Number, default: 0},
});

module.exports = mongoose.model("game", GameSchema);
