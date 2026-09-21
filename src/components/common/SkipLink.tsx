import { useEffect, useState } from 'react';
import './SkipLink.css';

export function SkipLink() {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const skipLink = document.getElementById('skip-to-main-content');
    if (skipLink) {
      skipLink.addEventListener('focus', handleFocus);
      skipLink.addEventListener('blur', handleBlur);
    }

    return () => {
      if (skipLink) {
        skipLink.removeEventListener('focus', handleFocus);
        skipLink.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  return (
    <a
      href="#main-content"
      id="skip-to-main-content"
      className={`skip-link ${isFocused ? 'focused' : ''}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      Skip to main content
    </a>
  );
}

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  );
}

export default SkipLink;
