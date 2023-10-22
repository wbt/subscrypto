import { TierCard } from "./TierCard";
import { TierSetup } from "./TierSetup";

export const TiersList = (props: { merchant?: string; tiersLength?: bigint }) => {
  const tiersLength = props.tiersLength;
  const merchant = props.merchant;
  if (typeof tiersLength == "undefined" || typeof merchant == "undefined") {
    return null;
  }
  const indicies = [];
  for (let i = 1n; i < tiersLength; i++) {
    indicies.push(i);
  }
  return (
    <div className="flex flex-col justify-center items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div className="flex justify-between w-full">
        <ol>
          {indicies.map(index => (
            <TierCard key={index.toString()} merchant={merchant} tierIndex={index} showOfferedStatus={true} />
          ))}
          <TierSetup />
        </ol>
      </div>
    </div>
  );
};
