import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { TierListing } from "~~/components/example-ui/TierListing";
import { WithdrawCredits } from "~~/components/example-ui/withdrawCredits";

const MerchantSetup: NextPage = () => {
  const { address } = useAccount();
  return (
    <>
      <MetaHeader
        title="API Merchant: Set up tiers"
        description="Allows the maker of an API to set up offerings to sell access for cryptocurrency payments."
      />
      <TierListing showOfferedStatus={true} merchant={address} />
      <WithdrawCredits />
    </>
  );
};

export default MerchantSetup;
