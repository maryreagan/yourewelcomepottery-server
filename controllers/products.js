const router = require("express").Router()
const Product = require("../models/Product")
const jwt = require("jsonwebtoken")
let sessionValidation = require("../middlewares/sessionValidation")
const aws = require("aws-sdk");
const multer = require("multer");
const multers3 = require("multer-s3");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const bodyParser = require('body-parser');


const s3 = new aws.S3({
    accessKeyId: process.env.POTTERY_ACCESS_KEY,
    secretAccessKey: process.env.POTTERY_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})


router.post("/checkout", async (req, res) => {

    const items = req.body.items;
    
    // This is an array of line items. Each line item contains the price and quantity of a product.
    const pricePromises = items.map(async (item) => {

        const product = await stripe.products.create({
            name: item.productName,
            images: [item.imageUrl]
        });

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: item.price * 100,
            currency: 'usd',
        });

        return price;
    });

    const prices = await Promise.all(pricePromises);

    let lineItems = [];
    items.forEach((item, index) => {
        lineItems.push(
            // This creates a line item object.
            {
                price: prices[index].id,
                quantity: item.quantity
            }
        )
    });

    try {

        // This creates a Stripe checkout session.
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
            payment_method_types: ['card'],
            mode: 'payment',
            automatic_tax: {
                enabled: true,
            },
            success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:5173/cancel"
        });

        res.json({ url: session.url });



    } catch (error) {
        // This logs the error and returns an error message to the client.
        console.error("Error creating session:", error);
        res.status(500).json({ error: "An error occurred while creating the payment session." });
    }
})


router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {

    const sig = req.headers['stripe-signature'];
    const payload = req.body
    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Error processing webhook:', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            /*for (const item of items) {
                // This gets the product object from the database using the priceID field.
                const product = await Product.findOne({ _id: item._id });
                console.log(`_id: ${product._id}, item: ${item._id}`);
                // This checks if the product exists. If it does, then the code subtracts the quantity from the product quantity in the database.
                if (product) {
                    console.log("FOUND PRODUCT!!")
                    console.log(`PRODUCT QNT BEFORE${product.quantity}`)
                    product.quantity -= 1 //items.quantity;
                    console.log(`PRODUCT QNT AFTER${product.quantity}`)
                    await product.save(); // This saves the updated product in the database.
                }
            }*/
            //console.log(paymentIntent.data);
            console.log(`****************************************************************`);
            break;
        case 'payment_intent.payment_failed':
            const paymentFailedIntent = event.data.object;
            // Notify the customer that their payment has failed
            break;
        // Handle other event types as needed
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).end();
});

router.post("/create", upload.single("file"), async (req, res) => { //upload.single("image") is middlware that processes an incoming file - this is part of multer

    try {
        let file = req.file
        const imageUrl = file.buffer //file.buffer is a property of multer middleware. Processed file's buffer is accessible Access binary data
        const { altText, productName, price, description, quantity, tag } = req.body
        console.log(altText, productName, price, quantity, tag)
        if (!altText || !productName || !price || !quantity || !tag) throw new Error("All fields are required")


        const s3Params = {
            Bucket: process.env.POTTERY_BUCKET_NAME,
            Key: `${Date.now()}-${req.file.originalname}`,//req.file is a propery of multer middleware and "originalname" is one of its properties
            Body: imageUrl,
            ACL: "public-read",//bucket is private, but will allow users to see image on client side. ACL = Access Control List (controls aces to objects store in S3 bucket)
            ContentType: req.file.mimtype,
        };

        const data = await s3.upload(s3Params).promise();

        const newProduct = new Product({
            imageUrl: data.Location,
            altText,
            productName,
            price,
            description,
            quantity,
            tag,
            priceID
        })

        console.log(newProduct)
        await newProduct.save()

        res.status(200).json({
            message: "Product added",
            newProduct
        })

    } catch (err) {
        res.status(500).json({
            message: err.message
        }),
            console.log(err)
    }
})


router.get("/all", async (req, res) => {
    try {
        let allProducts = await Product.find()
        if (allProducts.length == 0) throw new Error("No products found")
        res.status(200).json(allProducts)
    }

    catch (err) {
        res.status(500).json({
            message: err.message
        }),
            console.log(err)
    }

})

router.get("/:id", async (req, res) => {
    try {
        let { id } = req.params
        let oneProduct = await Product.findOne({ _id: id })
        if (!oneProduct) throw new Error("No products found")
        res.status(200).json(oneProduct)
    }

    catch (err) {
        res.status(500).json({
            message: err.message
        }),
            console.log(err)
    }

})

router.delete("/delete/:id", sessionValidation, async (req, res) => {
    try {
        let { id } = req.params
        let oneProduct = await Product.deleteOne({ _id: id })
        console.log(oneProduct)
        if (oneProduct.deletedCount == 0) throw Error("No products found")
        res.status(200).json({
            message: "Product deleted"
        })
    }

    catch (err) {
        res.status(500).json({
            message: err.message
        }),
            console.log(err)
    }

})

router.put("/update/:id", sessionValidation, upload.none(), async (req, res) => {
    try {
        console.log("HERE")
        let { id } = req.params
        let message = req.body
        Object.keys(message).forEach(key => {
            if (message[key] == "") delete message[key]
        })

        let oneProduct = await Product.updateOne({ _id: id }, { $set: message })
        console.log(oneProduct)
        if (oneProduct.matchedCount == 0) throw Error("No products found")
        res.status(200).json({
            message: "Product updated"
        })
    }

    catch (err) {
        res.status(500).json({
            message: err.message
        }),
            console.log(err)
    }
})


router.put("/updateImg/:_id", upload.single("file"), sessionValidation, async (req, res) => {
    try {
        let { _id } = req.params
        let file = req.file
        const image = file.buffer
        const s3Params = {
            Bucket: process.env.POTTERY_BUCKET_NAME,
            Key: `${Date.now()}-${req.file.originalname}`,//req.file is a propery of multer middleware and "originalname" is one of its properties
            Body: image,
            ACL: "public-read",//bucket is private, but will allow users to see image on client side. ACL = Access Control List (controls aces to objects store in S3 bucket)
            ContentType: req.file.mimtype,
        };
        const data = await s3.upload(s3Params).promise();

        let imageUrl = data.Location
        console.log(imageUrl)

        let oneProduct = await Product.updateOne({ _id: _id }, { imageUrl: imageUrl })
        console.log(oneProduct)
        if (oneProduct.matchedCount == 0) throw Error("No products found")
        res.status(200).json({
            message: "Product updated"
        })
    }

    catch (err) {
        res.status(500).json({
            message: err.message
        }),
            console.log(err)
    }
})

module.exports = router