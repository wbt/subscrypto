import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const ActiveStatus = (props: { merchant: string; tierIndex: bigint }) => {
  const { data: isActivelyOffered, isLoading: activeStatusIsLoading } = useScaffoldContractRead({
    contractName: "SubscryptoToken",
    functionName: "getTierisActivelyOffered",
    args: [props.merchant, props.tierIndex],
  });

  if (activeStatusIsLoading) {
    return <>Checking to see if this is actively offered.</>;
  } else {
    if (isActivelyOffered) {
      return <>Actively offered</>;
    } else {
      return <>Not actively offered.</>;
    }
  }
};
