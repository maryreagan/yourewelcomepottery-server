const router = require("express").Router()
const Product = require("../models/Product")
const bodyParser = require('body-parser');


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
