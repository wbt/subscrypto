import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { TierListing } from "~~/components/example-ui/TierListing";
import { TierSetup } from "~~/components/example-ui/TierSetup";

const MerchantSetup: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="API Merchant: Set up tiers"
        description="Allows the maker of an API to set up offerings to sell access for cryptocurrency payments."
      />
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <TierListing />
        <TierSetup />
      </div>
    </>
  );
};

export default MerchantSetup;
