const { mongoose } = require("../db")

const Product = new mongoose.Schema({
    altText: {
        type: String,
        required: true,
    },

    productName: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    description: {
        type: String,
        required: false,
    },

    quantity: {
        type: Number,
        required: true,
    },

    tag: {
        type: String,
        required: true
    },
    multipleImgs: {
        type: [String]
    }

})

module.exports = mongoose.model("products", Product)