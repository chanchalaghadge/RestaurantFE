import './ErrorAlert.css';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="error-alert" role="alert">
      <span className="error-alert-icon">⚠</span>
      <span className="error-alert-message">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="error-alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
}
