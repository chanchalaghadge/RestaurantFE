import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/common/Toast";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./styles/dark-mode.css";
import "./styles/responsive.css";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;