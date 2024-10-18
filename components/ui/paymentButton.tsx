'use client';
import { Button } from '@/components/ui/button'; // ShadCN button component
import { CreditCard, Loader } from 'lucide-react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';

const PaymentButton = ({
  amount,
  plan,
  callback,
}: {
  amount: number;
  plan: any;
  callback?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    const res = await loadRazorpayScript();
    if (!res) {
      // alert('Razorpay SDK failed to load. Are you online?');
      setIsLoading(false);
      return;
    }
    // create a new reciept uuid
    const receiptId = uuidv4();
    // Create order on the server
    const orderResponse = await fetch('/api/payment/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'USD',
        receipt: receiptId,
        notes: { plan },
      }),
    });

    const order = await orderResponse.json();

    const options = {
      key: process.env.RAZORPAY_KEY_SECRET,
      amount: order.amount,
      currency: order.currency,
      name: 'MicroAppLab',
      description: 'Payment for Subscription',
      order_id: order.id,
      handler: async (response: any) => {
        const paymentData = {
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        };

        const captureResponse = await fetch('/api/payment/capture-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentData.paymentId,
            amount,
            plan,
          }),
        });

        const payment = await captureResponse.json();
        // alert(`Payment successful: ${payment.status}`);
        setIsLoading(false);
        if (payment.status === 'captured' && callback) {
          callback();
        }
      },
      prefill: {
        name: session?.user?.name,
        email: session?.user?.email,
        contact: '+91111111111',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <Loader className="mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2" />
          Subscribe and Pay Now
        </>
      )}
    </Button>
  );
};

export default PaymentButton;
