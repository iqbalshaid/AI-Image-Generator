import { SignedIn, auth } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

import Header from "@/components/pagesComponent/Header";
import { Button } from "@/components/ui/button";
import { plans } from "@/constant";
import { getUserById } from "@/lib/actions/user.actions";
import Checkout from "@/components/pagesComponent/CheckOut";

const Credits = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header
        title="Buy Credits"
        subtitle="Choose a credit package that suits your needs!"
      />

      <section>
        <ul className="credits-list">
          {plans.map((plan) => (
            <li key={plan.name} className="credits-item">
              <div className="flex-center flex-col gap-3">
                <Image src={plan.icon} alt="check" width={50} height={50} />
                <p className="p-20-semibold mt-2 text-purple-500">
                  {plan.name}
                </p>
                <p className="h1-semibold text-dark-600">${plan.price}</p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              {/* Inclusions */}
              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map((inclusion) => (
                  <li
                    key={plan.name + inclusion.label}
                    className="flex items-center gap-4"
                  >
                    <Image
                      src="https://th.bing.com/th/id/R.b5a90f35a1f5f0f2e94b10b34214fdfc?rik=Pgqs3VIOPwQfKg&riu=http%3a%2f%2f4.bp.blogspot.com%2f_597Km39HXAk%2fTD6wy4iQ7-I%2fAAAAAAAAHdk%2fgOSUMdo5zKo%2fs1600%2fRupees-symbol.gif&ehk=lZMkEaPaLyYB19UriCCMNplfdow035vcOYekJmdAsBA%3d&risl=&pid=ImgRaw&r=0"
                      alt="check"
                      width={24}
                      height={24}
                    />
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Button variant="outline" className="credits-btn">
                  Free Consumable
                </Button>
              ) : (
                <SignedIn>
                  <Checkout
                    plan={plan.name}
                    amount={plan.price}
                    credits={plan.credits}
                    buyerId={user._id}
                  />
                </SignedIn>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Credits;