import './DateRangePicker.css';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  label?: string;
}

export default function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, label }: DateRangePickerProps) {
  return (
    <label className="date-range-picker">
      {label && <span>{label}</span>}
      <div className="date-range-inputs">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          aria-label="Start date"
        />
        <span>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          aria-label="End date"
        />
      </div>
    </label>
  );
}
