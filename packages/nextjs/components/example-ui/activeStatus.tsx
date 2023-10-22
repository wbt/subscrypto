import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const ActiveStatus = (props: { merchant: string; tierIndex: bigint }) => {
  const { data: isActivelyOffered, isLoading: activeStatusIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTierisActivelyOffered",
    args: [props.merchant, props.tierIndex],
  });

  let activeOfferText = "Checking to see if this is actively offered.";
  if (!activeStatusIsLoading) {
    if (isActivelyOffered) {
      activeOfferText = "Actively offered";
    } else {
      activeOfferText = "Not actively offered.";
    }
  }

  return <>{activeOfferText}</>;
};
