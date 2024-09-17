"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { checkoutCredits } from "@/lib/actions/transaction.actions"; // This will now create the Razorpay order on the server
import { Button } from "../ui/button";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const { toast } = useToast();

  useEffect(() => {
    // Optional: Can preload Razorpay script here if you want
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  
  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };

    try {
     
      const orderData = await checkoutCredits(transaction);

      const options = {
        key: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY, 
        amount: orderData.amount, 
        currency: orderData.currency,
        name: "Your Company Name",
        description: plan,
        order_id: orderData.orderId, 
        handler: function (response: any) {
       
          const paymentData = {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          
         

          toast({
            title: "Payment Successful!",
            description: "Your credits have been added.",
            duration: 5000,
            className: "success-toast",
          });
        },
        prefill: {
          name: "shahid", // Optional: pre-fill user's name
          email: "iqbalmdshahid147@gmail.com", // Optional: pre-fill user's email
        },
        theme: {
          color: "#3399cc", // Optional: customize color
        },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment Canceled!",
              description: "Payment process was canceled.",
              duration: 5000,
              className: "error-toast",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to initiate payment. Please try again.",
        duration: 5000,
        className: "error-toast",
      });
    }
  };

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button
          type="button"
          role="link"
          className="w-full rounded-full bg-purple-gradient bg-cover"
          onClick={onCheckout}
        >
          Buy Credit
        </Button>
      </section>
    </form>
  );
};

export default Checkout;
