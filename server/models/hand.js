const mongoose = require("mongoose");

const HandSchema = new mongoose.Schema({
    cards: [{
        symbol: String,
        suite: String,
    }],
    player: String,
    game: String,
});

module.exports = mongoose.model("hand", HandSchema);