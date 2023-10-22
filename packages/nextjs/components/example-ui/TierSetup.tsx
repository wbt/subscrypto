import { useState } from "react";
import { ActionButton } from "./actionButton";
import { parseEther } from "viem";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const TierSetup = () => {
  const [unitsPerWeek, setUnitsPerWeek] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "addTier",
    //@ts-ignore: not sure why it's not picking up that this function exists on this contract
    args: [parseInt(unitsPerWeek), parseEther(pricePerWeek)],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  return (
    <li className="py-8 px-5 border border-primary rounded-xl flex flex-col m-5">
      <span className="text-xl my-4">Create a new service tier:</span>
      Calls/activities per week maximum:
      <input type="number" className="input border border-primary" onChange={e => setUnitsPerWeek(e.target.value)} />
      <br />
      Price per week in credits (each ≈$1):
      <input type="number" className="input border border-primary" onChange={e => setPricePerWeek(e.target.value)} />
      <ActionButton onClick={writeAsync} text={"Create tier"} isLoading={isLoading} />
    </li>
  );
};
