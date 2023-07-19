const { default: mongoose } = require("mongoose")

const DB_URL = process.env.DB_URL

// connect server to database
const dbConnect = async () => {
    try{
        mongoose.set("strictQuery", true)
        await mongoose.connect(DB_URL, {  
            useNewUrlParser: true,
            useUnifiedTopology: true   
        })}
    catch(err){
        console.log(err)
    }
}

module.exports = {dbConnect, mongoose}