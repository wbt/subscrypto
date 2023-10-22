import { useState } from "react";
import { ActionButton } from "./actionButton";
import { WeeksInput } from "./weeksInput";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const SubscriberStatus = (props: { merchant: string; tierIndex: bigint; pricePerWeek: bigint | undefined }) => {
  const { address } = useAccount();
  const [weeksValue, weeksValueChange] = useState("");

  const { data: fixedConversionFromNative, isLoading: conversionRateIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "fixedConversionFromNative",
  });

  const { data: currentTier, isLoading: currentTierIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTier",
    args: [props.merchant, address],
  });

  const { data: remainingSeconds, isLoading: remainingSecondsIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "remainingSecondsAtCurrentTier",
    args: [props.merchant, address],
  });

  const getEtherValue = function (pricePerWeek: bigint | undefined, weeksValue: string) {
    if (typeof pricePerWeek === "undefined" || typeof fixedConversionFromNative === "undefined") {
      return 0n;
    }
    const weeksFloat = parseFloat(weeksValue);
    if (Number.isNaN(weeksFloat)) {
      return 0n;
    }
    const multiple = 100000;
    const weeksMultiplied = weeksFloat * multiple;
    const numericResult = (BigInt(weeksMultiplied) * pricePerWeek) / (fixedConversionFromNative * BigInt(multiple));
    return numericResult; //formatEther(numericResult); //docs suggest use of the commented-out part:
    //https://docs.scaffoldeth.io/hooks/useScaffoldContractWrite
  };

  const { writeAsync: depositAndSubscribe, isLoading: depositIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "depositEthToSubscription",
    args: [props.merchant, props.tierIndex],
    // ts-ignore docs say value is string, not bigint
    value: getEtherValue(props.pricePerWeek, weeksValue),
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: cancelAndRefund, isLoading: cancellationIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "stopAndRefundToNativeToken",
    args: [props.merchant],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const anythingIsLoading =
    currentTierIsLoading ||
    remainingSecondsIsLoading ||
    depositIsLoading ||
    cancellationIsLoading ||
    conversionRateIsLoading;

  if (currentTierIsLoading) {
    return <>Checking to see what tier you may already be subscribed to.</>;
  } else {
    if (currentTier == props.tierIndex) {
      return (
        <>
          You are currently subscribed to this tier.
          <br />
          You can continue subscribed to this tier for{" "}
          {
            /*TODO: Is it ' an unclear number of ' or 0? */
            (typeof remainingSeconds === "undefined" ? 0 : remainingSeconds / 86400n) + " "
          }{" "}
          more days with your current balance.
          <ActionButton
            onClick={cancelAndRefund}
            isLoading={anythingIsLoading}
            text={"Cancel my subscription; refund any remaining prepayments."}
          />
          <br />
          {"Extend my subscription "}
          <WeeksInput weeksValue={weeksValue} weeksValueChange={weeksValueChange} />
          <ActionButton onClick={depositAndSubscribe} isLoading={anythingIsLoading} text={"Extend"} />
        </>
      );
    } else {
      return (
        <>
          {"Subscribe to this tier & add payment "}
          <WeeksInput weeksValue={weeksValue} weeksValueChange={weeksValueChange} />
          <ActionButton onClick={depositAndSubscribe} isLoading={anythingIsLoading} text={"Subscribe"} />
        </>
      );
    }
  }
};
