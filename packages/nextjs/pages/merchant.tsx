import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { TierListing } from "~~/components/example-ui/TierListing";

const MerchantSetup: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="API Merchant: Set up tiers"
        description="Allows the maker of an API to set up offerings to sell access for cryptocurrency payments."
      />
      <TierListing showOfferedStatus={true} />
    </>
  );
};

export default MerchantSetup;
