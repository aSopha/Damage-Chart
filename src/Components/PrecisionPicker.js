import { PRECISION_MAP } from "../Constants";
export const PrecisionPicker = ({value, onChange, setRange}) => {
  return (
    <div className="PrecisionPicker">
      <input type="radio" checked={value === 'high'}value="high" name="precision" onChange={() => {setRange([0,99999]); onChange('high')}}/><p className="PrecisionPickerText"> High({PRECISION_MAP['high']}s)</p>
      <input type="radio" checked={value === 'medium'}value="medium" name="precision" onChange={() => {setRange([0,99999]);  onChange('medium')}}/><p className="PrecisionPickerText"> Medium({PRECISION_MAP['medium']}s)</p>
      <input type="radio" checked={value === 'low'}value="low" name="precision" onChange={() => {setRange([0,99999]);  onChange('low')}}/><p className="PrecisionPickerText"> Low({PRECISION_MAP['low']}s)</p>
    </div>
  );
}