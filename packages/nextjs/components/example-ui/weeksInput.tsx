export const WeeksInput = (props: {
  weeksValue: string;
  weeksValueChange: ((newWeeks: string) => void) | undefined;
}) => {
  return (
    <>
      {typeof props.weeksValueChange === "undefined" ? null : (
        <>
          {"for "}
          <input
            className="text-black"
            type="number"
            min={0}
            value={props.weeksValue}
            onChange={e => props.weeksValueChange!(e.target.value)}
          />
          {" weeks: "}
        </>
      )}
    </>
  );
};
