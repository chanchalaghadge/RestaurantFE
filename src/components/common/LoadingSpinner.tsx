/**
 * Reusable loading spinner component
 * Provides consistent loading states across the application
 */

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  text, 
  fullScreen = false,
  overlay = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: { width: '16px', height: '16px', borderWidth: '2px' },
    medium: { width: '32px', height: '32px', borderWidth: '2px' },
    large: { width: '48px', height: '48px', borderWidth: '3px' }
  };

  const containerClasses = `
    loading-spinner
    ${fullScreen ? 'full-screen' : ''}
    ${overlay ? 'overlay' : ''}
  `;

  const spinnerClasses = `
    spinner
    spinner-${size}
  `;

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div 
        className={spinnerClasses}
        style={sizeClasses[size]}
      />
      {text && (
        <p className="loading-text">{text}</p>
      )}
    </div>
  );
}