import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/dark-mode.css";
import "./styles/responsive.css";

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;