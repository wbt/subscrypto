import { ActionButton } from "./actionButton";
import type { TransactionReceipt } from "viem";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const ActiveStatus = (props: {
  merchant: string;
  tierIndex: bigint;
  activeStatusIsLoading: boolean;
  isActivelyOffered: boolean | undefined;
}) => {
  const { writeAsync: setActivelyOfferedTrue, isLoading: writeTrueIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "setTierisActivelyOffered",
    args: [props.tierIndex, true],
    onBlockConfirmation: (txnReceipt: TransactionReceipt) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });
  //TODO: DRY above + below
  const { writeAsync: setActivelyOfferedFalse, isLoading: writeFalseIsLoading } = useScaffoldContractWrite({
    contractName: "SubscryptoToken",
    functionName: "setTierisActivelyOffered",
    args: [props.tierIndex, false],
    onBlockConfirmation: (txnReceipt: TransactionReceipt) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const anythingIsLoading = props.activeStatusIsLoading || writeTrueIsLoading || writeFalseIsLoading;

  if (props.activeStatusIsLoading) {
    return <>Checking to see if this is actively offered.</>;
  } else {
    if (props.isActivelyOffered) {
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
