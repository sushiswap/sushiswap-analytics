import { Percent } from ".";

export default function Difference(previousValue, currentValue) {
  const value = ((currentValue - previousValue) / previousValue) * 100;
  return <Percent value={value} />;
}
