const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    key: String,
    players: [String],
    hands: [String],
    teamEven: [String],
    teamOdd: [String],
});

module.exports = mongoose.model("game", GameSchema);
