import { useState } from "react";
import { parseEther } from "viem";
import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";
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
    <div className="flex bg-base-300 relative pb-10">
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-xl my-4">Create a new service tier:</span>
          <input
            type="number"
            placeholder="Calls/activities per week maximum"
            className="input w-full px-5 border border-primary text-lg my-4"
            onChange={e => setUnitsPerWeek(e.target.value)}
          />
          <br />
          <input
            type="number"
            placeholder="Price per week in credits (each ≈$1)"
            className="input w-full px-5 border border-primary text-lg my-4"
            onChange={e => setPricePerWeek(e.target.value)}
          />
          <div className="flex rounded-full p-1 flex-shrink-0 place-content-end">
            <button
              className="btn btn-primary rounded-full capitalize font-normal font-white flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
              onClick={() => writeAsync()}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Create tier <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
