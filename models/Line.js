const { mongoose } = require("../db")

const Line = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    products : {
        type: Array
    }
}) 
module.exports = mongoose.model("line", Line)