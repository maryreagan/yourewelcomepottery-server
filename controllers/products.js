const router = require("express").Router()
const Product = require("../models/Product")
const jwt = require ("jsonwebtoken")

const aws = require("aws-sdk");
const multer = require("multer");
const multers3 = require("multer-s3");

const s3 = new aws.S3({
  accessKeyId: process.env.POTTERY_ACCESS_KEY,
  secretAccessKey: process.env.POTTERY_SECRET_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const upload = multer({
    storage: multer.memoryStorage(),
        limits:{
        fileSize: 10 * 1024 * 1024
    }
})

application.post("/api/products", upload.single("image"), async (req, res) =>{ //upload.single("image") is middlware that processes an incoming file - this is part of multer
    try{
        const { altText, productName, price, description, quantity, tag } = req.body
        const imageUrl = req.file.buffer //file.buffer is a property of multer middleware. Processed file's buffer is accessible Access binary data

        const s3Params = {
            Bucket: process.env.POTTERY_BUCKET_NAME,
            Key: `${Date.now()}-${req.file.originalname}`,//req.file is a propery of multer middleware and "originalname" is one of its properties
            Body: imageUrl,
            ACL: "public-read",//bucket is private, but will allow users to see image on client side. ACL = Access Control List (controls aces to objects store in S3 bucket)
            ContentType: req.file.mimtype,
        };

        const newProduct = new Product ({
            imageUrl: data.Location,
            altText,
            productName,
            price,
            description,
            quantity,
            tag
        })

        console.log(newProduct)
        await newProduct.save()

        res.status(200).json({
            message: "Product added",
            newProduct
        })

    }catch(err){
        console.log(err)
    }
})