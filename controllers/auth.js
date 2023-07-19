let router = require ("express").Router()
let UserSchema = require("../models/Users")
let bcrypt = require("bcryptjs")
let jwt = require ("jsonwebtoken")
let SALT = Number(process.env.SALT)
let JWT_KEY = process.env.JWT_KEY



router.post("/register", async (req,res) =>{
    try{
        // check for all requirements
        let {email, password} = req.body
        if (!email || !password) throw Error ("Please fill in all requirements")

        // Find the user with the provided email
        let newUser = new UserSchema({email: email , password: bcrypt.hashSync(password, SALT)})
        newUser.save()


        // Generate a JWT token for the user
        let token = jwt.sign(
            {id: newUser.id},
            JWT_KEY
        )

        res.status(200).json({
            message: "User Registered in",
            token
    })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
    })
    }
}
)




router.post("/login", async (req,res) =>{
    try{
        // check for all requirements
        let {email, password} = req.body
        if (!email || !password) throw Error ("Please fill in all requirements")

        // Find the user with the provided email
        let foundUser = await UserSchema.findOne({email})
        if (!foundUser) throw Error ("No user found")

        // Verify the password
        let verifiedPassword = await bcrypt.compare(password, foundUser.password)
        if (!verifiedPassword) throw Error ("Wrong password")


        // Generate a JWT token for the user
        let token = jwt.sign(
            {id: foundUser.id},
            JWT_KEY
        )

        res.status(200).json({
            message: "User logged in",
            token
    })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            message: `${err}`
    })
    }
}
)

module.exports = router