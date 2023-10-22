import { ActionButton } from "./actionButton";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const ActiveStatus = (props: { merchant: string; tierIndex: bigint }) => {
  const { data: isActivelyOffered, isLoading: activeStatusIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTierisActivelyOffered",
    args: [props.merchant, props.tierIndex],
  });

  const { writeAsync: setActivelyOfferedTrue, isLoading: writeTrueIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "setTierisActivelyOffered",
    args: [props.tierIndex, true],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });
  //TODO: DRY above + below
  const { writeAsync: setActivelyOfferedFalse, isLoading: writeFalseIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "setTierisActivelyOffered",
    args: [props.tierIndex, false],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const anythingIsLoading = activeStatusIsLoading || writeTrueIsLoading || writeFalseIsLoading;

  if (activeStatusIsLoading) {
    return <>Checking to see if this is actively offered.</>;
  } else {
    if (isActivelyOffered) {
      return (
        <>
          Actively offered.
          <br />
          <ActionButton
            onClick={setActivelyOfferedFalse}
            isLoading={anythingIsLoading}
            text={"Stop offering this tier to new clients"}
          />
        </>
      );
    } else {
      return (
        <>
          Not actively offered.
          <br />
          <ActionButton
            onClick={setActivelyOfferedTrue}
            isLoading={anythingIsLoading}
            text={"Offer this tier to new clients"}
          />
        </>
      );
    }
  }
};
