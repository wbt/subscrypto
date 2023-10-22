import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";

export const ActionButton = (props: { onClick: () => void; isLoading: boolean; text: string }) => {
  return (
    <div className="flex rounded-full p-1 flex-shrink-0 place-content-end">
      <button
        className="btn btn-primary rounded-full capitalize font-normal font-white flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
        onClick={() => props.onClick()}
        disabled={props.isLoading}
      >
        {props.isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <>
            {props.text + " "} <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
          </>
        )}
      </button>
    </div>
  );
};
