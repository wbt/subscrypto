import { formatEther } from "viem";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const TierCard = (props: { merchant: string; tierIndex: bigint; showOfferedStatus: boolean }) => {
  const { data: unitsPerWeek, isLoading: unitsIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTierUnitsPerWeek",
    args: [props.merchant, props.tierIndex],
  });
  const { data: pricePerWeek, isLoading: priceIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTierPricePerWeek",
    args: [props.merchant, props.tierIndex],
  });
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

  return (
    <li className="py-8 px-5 border border-primary rounded-xl flex m-5">
      Calls/activities per week maximum:{" "}
      {unitsIsLoading ? "Loading..." : typeof unitsPerWeek === "undefined" ? "*" : unitsPerWeek.toString()}
      <br />
      Price per week in credits (each ≈$1):{" "}
      {priceIsLoading ? "Loading..." : typeof pricePerWeek === "undefined" ? "*" : formatEther(pricePerWeek)}
      <br />
      {props.showOfferedStatus ? activeOfferText : null}
    </li>
  );
};
