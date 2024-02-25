const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Key: { type: String },
    ip: { type: String, default: "" },
    id: { type: String },
    data: { type: Object }
});

module.exports = mongoose.model("hexifyAuth", Schema);