import { MetaHeader } from "~~/components/MetaHeader";
import { TierListing } from "~~/components/example-ui/TierListing";

export default function CustomerPage({ params }: { params: { merchant: string } }) {
  console.log("Params:", params);
  return (
    <>
      <MetaHeader
        title="API Customer: Manage Subscriptions"
        description="Allows API users to pay with cryptocurrency."
      />
      <TierListing showOfferedStatus={false} merchant={params.merchant} />
    </>
  );
}
