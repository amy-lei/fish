const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    key: String,
    players: [{
        name: String,
        index: Number,
        ready: {type: Boolean, default: false},
        active: {type: Boolean, default: true},
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
    start: {type: Boolean, default: false},
});

module.exports = mongoose.model("game", GameSchema);
