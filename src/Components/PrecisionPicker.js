import { PRECISION_MAP } from "../Constants";
export const PrecisionPicker = ({value, onChange, setRange}) => {
  return (
    <div className="PrecisionPicker">
      <input type="radio" checked={value === 'high'}value="high" name="precision" onChange={() => {setRange([0,99999]); onChange('high')}}/> High({PRECISION_MAP['high']}s)
      <input type="radio" checked={value === 'medium'}value="medium" name="precision" onChange={() => {setRange([0,99999]);  onChange('medium')}}/> Medium({PRECISION_MAP['medium']}s)
      <input type="radio" checked={value === 'low'}value="low" name="precision" onChange={() => {setRange([0,99999]);  onChange('low')}}/> Low({PRECISION_MAP['low']}s)
    </div>
  );
}