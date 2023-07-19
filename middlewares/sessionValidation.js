
let jwt = require("jsonwebtoken")
let userSchema = require("../models/Users")
// variable set to sign the JWT
let JWT_KEY = process.env.JWT_KEY

// Middleware function for token authentication
let sessionValidation = async (req,res,next) => {
    try{
        // Continue to the next middleware if it's an OPTIONS request
        if (req.method == "OPTIONS") next()

        // no Token provided
        if (!req.headers.authorization) throw Error ("Access denied")

        // sanitize token
        let token = req.headers.authorization.includes("Bearer") 
        if (token) {
            token = req.headers.authorization.split(" ")[1]
        }
        else{
            token = req.headers.authorization
        }
        // validate token
        let payload = jwt.verify(token, JWT_KEY)
        if (!payload) throw Error ("Invalid token")

        // find User based on payload
        let foundUser = await userSchema.findOne({_id: payload.id})
        if (!foundUser) throw Error ('User does not exist')
        next()
        // Proceed to the next middleware or route handler
    }
    catch(err){
        res.status(500).json({
            message: `${err}`
        })
    }
}

module.exports= sessionValidation