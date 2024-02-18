const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    userID: { type: String },
    RankCard: {
        
        progressBarColors: { type: String, default: '#efc75e' },
        discriminatorColor: { type: String, default: '#242424' },
    }
});

module.exports = mongoose.model("LevelsConfig", Schema);
