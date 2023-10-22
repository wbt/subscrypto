import Link from "next/link";
import type { NextPage } from "next";
import { BuildingStorefrontIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Subscrypto</span>
          </h1>
          <p className="text-center text-lg">
            If you want to start earning crypto revenue from your new API, you can set up your usage/price/feature tiers
            with Subscrypto quickly, offer your own checkout experience prompting a blockchain transaction for
            prepayment of as many months as a customer wants (unused portion refundable) and query on-chain data to
            figure out if they are current on their subscription. Customers can adjust their tier or discontinue service
            at any time and pay for the period actually subscribed.
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BuildingStorefrontIcon className="h-8 w-8 fill-secondary" />
              <p>
                API sellers/merchants:
                <br />
                <Link href="/merchant" passHref className="link">
                  Click here
                </Link>
                {" to set up pricing tiers."}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ShoppingCartIcon className="h-8 w-8 fill-secondary" />
              <p>
                API users/customers:
                <br />
                <Link href="/customer" passHref className="link">
                  Click here
                </Link>{" "}
                to add or manage a subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
