const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Code: String,
    Log: String
});

module.exports = mongoose.model("changelogs", Schema);