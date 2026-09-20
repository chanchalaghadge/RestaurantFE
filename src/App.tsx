import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/common/Toast";
import { LanguageProvider } from "./contexts/LanguageContext";
import { OfflineIndicator } from "./components/common/OfflineIndicator";
// import SkipLink from "./components/common/SkipLink"; // Temporarily disabled
import "./styles/dark-mode.css";
import "./styles/responsive.css";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            {/* <SkipLink /> */} {/* Temporarily disabled */}
            <OfflineIndicator />
            <AppRoutes />
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;