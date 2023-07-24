
let userSchema = require("../models/Users")
let router = require('express').Router();
let nodemailer = require('nodemailer');


router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();})

function sendEmail({email, OTP }) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
    })
    let mailConfigs = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Test",
        html:`<!DOCTYPE html>
        <html lang="en" >
        <head>
          <meta charset="UTF-8">
          <title>CodePen - OTP Email Template</title>
          
        
        </head>
        <body>
        <!-- partial:index.partial.html -->
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">You're Welcome Pottery</a>
            </div>
            <p style="font-size:1.1em">Hi,</p>
            <p>Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
            <p style="font-size:0.9em;">Thx,<br />You're Welcome Pottery</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              <p>Koding 101 Inc</p>
              <p>1600 Amphitheatre Parkway</p>
              <p>California</p>
            </div>
          </div>
        </div>
        <!-- partial -->
          
        </body>
        </html>`,
            };

            transporter.sendMail(mailConfigs, (error, info) => {
                if (error) {console.error(error)
                    return reject ({message: "Error no good"});}
                    return resolve({message: "sent"});
                })
            })
    }

    router.post('/forgot/:email', async (req, res) => {
      try{
      email = req.params.email.trim().toLowerCase();
      let {OTP} = req.body;
      let foundEmail = await userSchema.findOne({email: email});
      if (!foundEmail) throw Error ("No User Found")
      console.log(req.body)
      sendEmail({email, OTP})  
      res.status(200).json({
        message:"Sent" 
      }) 
      
    }  
      catch(err){
        res.status(500).json({
          message: "No user found"
        })
        console.log(err)
      }  
    }
    )


    module.exports = router;  