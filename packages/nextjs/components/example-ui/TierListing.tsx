import { TiersList } from "./TierList";
import { useAccount } from "wagmi";
import {
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

export const TierListing = () => {
  const { address } = useAccount();

  const { data: tiersLength, isLoading: isTierCountLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTiersCount",
    args: [address],
  });

  useScaffoldEventSubscriber({
    contractName: "SubscryptoToken",
    eventName: "TierAdded",
    listener: logs => {
      logs.map(log => {
        const { merchant, tierIndex, unitsPerWeek, pricePerWeek, isActivelyOffered } = log.args;
        console.log("📡 TierAdded event", merchant, tierIndex, unitsPerWeek, pricePerWeek, isActivelyOffered);
      });
    },
  });

  const {
    data: myGreetingChangeEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "SubscryptoToken",
    eventName: "TierAdded",
    fromBlock: process.env.NEXT_PUBLIC_DEPLOY_BLOCK ? BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) : 0n,
    filters: { merchant: address },
    blockData: true,
  });

  console.log("Events:", isLoadingEvents, errorReadingEvents, myGreetingChangeEvents);

  const { data: yourContract } = useScaffoldContract({ contractName: "SubscryptoToken" });
  console.log("subscryptoToken: ", yourContract);

  let tierCountText = "No defined tiers for this merchant account yet! You can create one below.";
  if (isTierCountLoading) {
    tierCountText = "Loading...";
  } else if (typeof tiersLength === "undefined") {
    tierCountText = "Error loading defined tiers.";
  } else if (tiersLength === 1n) {
    tierCountText = (tiersLength - 1n).toString() + " defined tier:";
  } else if (tiersLength > 1n) {
    tierCountText = (tiersLength - 1n).toString() + " defined tiers:";
  }

  return (
    <div className="w-full">
      <div className="topRow">
        <h2 className="text-4xl">{tierCountText}</h2>
      </div>
      <TiersList merchant={address} tiersLength={tiersLength} />
    </div>
  );
};
