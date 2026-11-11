const Razorpay = require("razorpay");

// Initialize Razorpay instance with your key_id and key_secret from environment variables
const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpay;