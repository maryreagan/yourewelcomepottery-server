require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const { dbConnect } = require("./db")

const PORT = process.env.PORT || 4000
const HOST = process.env.HOST || "127.0.0.1"

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(PORT, HOST, () => {
    //dbConnect()
    console.log(`[serve] listenbing on ${HOST}: ${PORT}`)
})