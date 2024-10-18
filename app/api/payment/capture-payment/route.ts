import { NextResponse } from 'next/server';
import RazorpayObject from '../../../../lib/razorpay';
import { auth } from '@/auth';
import { saveSubscription } from '@/app/lib/data';

const savePaymentAndSubscription = async (
  paymentDetails: any,
  plan: any,
  paymentId: string,
  amount: number
) => {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = session; // Assuming you have userId in the session

  // Save subscription to the database
  const result = await saveSubscription({
    userId,
    plan,
    paymentId,
    amount,
  });
};

export async function POST(request: any) {
  const { paymentId, amount, plan } = await request.json();
  try {
    let paymentDetails = await RazorpayObject.payments.fetch(paymentId);
    // Check if payment has already been captured
    if (paymentDetails.status === 'captured') {
      savePaymentAndSubscription(paymentDetails, plan, paymentId, amount);
    } else {
      const paymentDetails = await RazorpayObject.payments.capture(
        paymentId,
        amount * 100
      );
      savePaymentAndSubscription(paymentDetails, plan, paymentId, amount);
    }
    return NextResponse.json({ status: paymentDetails.status });
  } catch (error) {
    console.log('Error occured while capturing payment', error);
    return NextResponse.json(
      { error: 'Error capturing payment' },
      { status: 500 }
    );
  }
}
