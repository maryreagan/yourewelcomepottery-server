const router = require("express").Router()
const Line = require("../models/Line")
const jwt = require("jsonwebtoken")
const fetch = require("node-fetch")
let sessionValidation = require("../middlewares/sessionValidation")

//Get all lines
router.get("/", async (req, res) => {
    try{
        let lines = await Line.find({})
        res.status(200).json({
            message: "All lines",
            lines
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})
//Get line be id
router.get("/:lineId", async (req, res) => {
    try{
        let line = await Line.findById(req.params.lineId)
        res.status(200).json({
            message: "Line found",
            line
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})
//Create a line
router.post("/", sessionValidation, async (req, res) => {
    try{
        let {name} = req.body
        if(!name) throw Error("Please fill in all requirements")
        let newLine = new Line({name})
        newLine.save()
        res.status(200).json({
            message: "Line created",
            newLine
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})
//Update a line
router.put("/:lineId", sessionValidation, async (req, res) => {
    try{
        let {name} = req.body
        if(!name) throw Error("Please fill in all requirements")
        let updatedLine = await Line.findByIdAndUpdate(req.params.lineId, {name}, {new: true})
        res.status(200).json({
            message: "Line updated",
            updatedLine
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})
//Delete a line
router.delete("/:lineId", sessionValidation, async (req, res) => {
    try{
        let deletedLine = await Line.findByIdAndDelete(req.params.lineId)
        res.status(200).json({
            message: "Line deleted",
            deletedLine
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})
//Add a product to a line
router.put("/:lineId/add/:productId", sessionValidation, async (req, res) => {
    try{
        let {lineId, productId} = req.params
        let findOne = await Line.findOne({_id: lineId})
        if(!findOne) throw Error("Line not found")
        if(!findOne.products.includes(productId)){
            let updateOne = await Line.updateOne({_id: lineId}, {$push: {products: productId}})
            res.status(200).json({
                message: "Product added to line",
                updateOne
            })
        } else {
            res.status(200).json({
                message: "Product already in line"
            })
        }
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})
//Remove a product from a line
router.put("/:lineId/remove/:productId", sessionValidation, async (req, res) => {
    try{
        let {lineId, productId} = req.params
        let findOne = await Line.findOne({_id: lineId})
        if(!findOne) throw Error("Line not found")
        if(findOne.products.includes(productId)){
            let updateOne = await Line.updateOne({_id: lineId}, {$pull: {products: productId}})
            res.status(200).json({
                message: "Product removed from line",
                updateOne
            })
        } else {
            res.status(200).json({
                message: "Product not in line"
            })
        }
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
}) //Move product to another line
router.put("/:original/move/:productId/:newLine", sessionValidation, async (req, res) => {
    try{
        let {original, productId, newLine} = req.params
        const fetchResponse = await fetch(`https://youre-welcome-pottery-server-5b5629123e07.herokuapp.com/line/${original}/remove/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": req.headers.authorization
            }
        })
        const fetchResponse2 = await fetch(`https://youre-welcome-pottery-server-5b5629123e07.herokuapp.com/line/${newLine}/add/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": req.headers.authorization
            }
        })
        const response = await fetchResponse.json()
        const response2 = await fetchResponse2.json()
        res.status(200).json({
            message: "Product moved",
            response,
            response2
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }

})

module.exports = router