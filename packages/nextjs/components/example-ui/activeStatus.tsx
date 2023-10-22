import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const ActiveStatus = (props: { merchant: string; tierIndex: bigint }) => {
  const { data: isActivelyOffered, isLoading: activeStatusIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTierisActivelyOffered",
    args: [props.merchant, props.tierIndex],
  });

  let activeOfferText = "Actively offered";
  if (activeStatusIsLoading) {
    activeOfferText = "Checking to see if this is actively offered.";
  } else if (!isActivelyOffered) {
    activeOfferText = "Not actively offered.";
  }

  return <>{activeOfferText}</>;
};
