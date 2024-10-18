const Razorpay = require('razorpay');

const RazorpayObject = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default RazorpayObject;
