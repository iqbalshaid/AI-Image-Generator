"use server";

import { redirect } from 'next/navigation';
import Razorpay from 'razorpay';
import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits } from './user.actions';

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  // Initialize Razorpay instance with your Razorpay keys
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY!,
    key_secret: process.env.Razorpay_secret_key!,
  });

  const amount = Number(transaction.amount) * 100; // Razorpay expects amount in paise (cents)

  // Create an order in Razorpay
  const options = {
    amount, // amount in paise (cents)
    currency: 'INR',
    receipt: `receipt_${transaction.buyerId}`, // A unique receipt ID
    payment_capture: 1, // 1 means automatic capture, 0 means manual
  };

  try {
    const order = await razorpay.orders.create(options);

    // Pass this order_id to the client for payment processing via Razorpay frontend SDK
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY, // Send key ID to client
      transactionMetadata: {
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL }/profile`, 
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL }/`,
    };
  } catch (error) {
    handleError(error);
    throw new Error('Unable to create Razorpay order');
  }
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with a buyerId
    const newTransaction = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
    });

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}
