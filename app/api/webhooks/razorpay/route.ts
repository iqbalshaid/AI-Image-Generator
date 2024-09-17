/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.actions";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("x-razorpay-signature") as string;
  const endpointSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  // Compute the expected signature using HMAC SHA256
  const hmac = crypto.createHmac("sha256", endpointSecret);
  hmac.update(body);
  const digest = hmac.digest("hex");

  // Verify the signature
  if (sig !== digest) {
    return NextResponse.json({ message: "Webhook signature verification failed" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Handle different types of events
  const eventType = event.event;

  if (eventType === "payment.captured") {
    const { id, amount, notes } = event.payload.payment.entity;

    const transaction = {
      razorpayId: id,
      amount: amount ? amount / 100 : 0, // Razorpay sends the amount in paise
      plan: notes?.plan || "",
      credits: Number(notes?.credits) || 0,
      buyerId: notes?.buyerId || "",
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction);

    return NextResponse.json({ message: "OK", transaction: newTransaction });
  }

  return new Response("", { status: 200 });
}
