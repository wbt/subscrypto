import { TierCard } from "./TierCard";
import { TierSetup } from "./TierSetup";

export const TierList = (props: { merchant?: string; tiersLength?: bigint; showOfferedStatus: boolean }) => {
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
    <div className="flex flex-col justify-center items-center px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <ol>
        {indicies.map(index => (
          <TierCard
            key={index.toString()}
            merchant={merchant}
            tierIndex={index}
            showOfferedStatus={props.showOfferedStatus}
          />
        ))}
        {props.showOfferedStatus ? <TierSetup /> : null}
      </ol>
    </div>
  );
};
