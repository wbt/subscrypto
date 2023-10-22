import { useState } from "react";
import { ActionButton } from "./actionButton";
import { formatEther } from "viem";
import type { TransactionReceipt } from "viem";
import { useAccount } from "wagmi";
import { isAddress } from "web3-validator";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const RecognizeRevenue = () => {
  const { address } = useAccount();
  const [customerAddr, setCustomerAddr] = useState("");

  const { data: balance, isLoading: balanceIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "amountDueToMerchantMinusFees",
    args: [address, customerAddr],
  });
  const { writeAsync, isLoading: withdrawalIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "claimRevenueToNativeToken",
    //@ts-ignore not sure why it's not picking up on this function's presence.
    args: [address, customerAddr],
    onBlockConfirmation: (txnReceipt: TransactionReceipt) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });
  let balanceText = "No address was recognized in the box above.";
  if (isAddress(customerAddr)) {
    balanceText = "Your balance is loading.";
    if (!balanceIsLoading) {
      if (typeof balance === "undefined") {
        balanceText = "You have no currently recognizable available balance from this customer.";
      } else {
        balanceText = "You have " + formatEther(balance) + " credits available for past periods from this customer.";
      }
    }
  }

  return (
    <li className="py-8 px-5 border border-primary rounded-xl flex flex-col m-5">
      <span className="text-xl my-4">
        Recognize Revenue: With this tool, you can withdraw payments for past periods of a subscription from a specific
        customer, which have not already been moved to your freely withdrawable balance or previously withdrawn.
      </span>
      <br />
      Enter a customer address:
      <br />
      <input
        className="width-3/5 text-black"
        type="text"
        placeholder="e.g. 0x7aDb4fC14fD18694e0961aF923E3550fbb137385"
        value={customerAddr}
        onChange={e => setCustomerAddr(e.target.value)}
      />
      <br />
      {balanceText}
      <br />
      <ActionButton onClick={writeAsync} text={"Withdraw"} isLoading={balanceIsLoading || withdrawalIsLoading} />
    </li>
  );
};
