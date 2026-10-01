console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
console.log(
  "Razorpay Secret length:",
  process.env.RAZORPAY_KEY_SECRET?.length
);
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;