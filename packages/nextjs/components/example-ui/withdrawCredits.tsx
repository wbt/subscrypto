import { ActionButton } from "./actionButton";
import { formatEther } from "viem";
import type { TransactionReceipt } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const WithdrawCredits = () => {
  const { address } = useAccount();
  const { data: balance, isLoading: balanceIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "balanceOf",
    args: [address],
  });
  const { writeAsync, isLoading: withdrawalIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "withdraw",
    //@ts-ignore not sure why it's not picking up on this function's presence.
    args: [],
    onBlockConfirmation: (txnReceipt: TransactionReceipt) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });
  let balanceText = "Your balance is loading.";
  if (!balanceIsLoading) {
    if (typeof balance === "undefined") {
      balanceText = "You have no currently recognizable free balance.";
    } else {
      balanceText = "You have " + formatEther(balance) + " credits available for withdrawal.";
    }
  }

  return (
    <li className="py-8 px-5 border border-primary rounded-xl flex flex-col m-5">
      <span className="text-xl my-4">Withdraw credits:</span>
      {balanceText}
      <ActionButton onClick={writeAsync} text={"Withdraw all"} isLoading={balanceIsLoading || withdrawalIsLoading} />
    </li>
  );
};
