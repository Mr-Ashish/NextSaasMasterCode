import { NextResponse } from 'next/server';
import RazorpayObject from '../../../../lib/razorpay';

export async function POST(request: any) {
  const { amount, currency, receipt } = await request.json();
  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt,
      payment_capture: 1,
    };
    const order = await RazorpayObject.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    );
  }
}
