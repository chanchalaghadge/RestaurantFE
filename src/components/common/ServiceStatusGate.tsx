import { type ReactNode, useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../api/client";
import "./ServiceStatusGate.css";

type ServiceState = "checking" | "available" | "unavailable";

const HEALTH_CHECK_TIMEOUT_MS = 8_000;

async function isServiceAvailable(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      cache: "no-store",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

function ServiceUnavailable({ onRetry, checking }: { onRetry: () => void; checking: boolean }) {
  return (
    <main className="service-unavailable" role="alert" aria-live="assertive">
      <section className="service-unavailable-card">
        <div className="service-status-orbit" aria-hidden="true">
          <span className="service-status-core">!</span>
          <i /><i /><i />
        </div>
        <p className="service-status-label"><span />Service disruption</p>
        <h1>We’re temporarily unavailable</h1>
        <p className="service-status-message">
          Our service is having trouble connecting to its database. Your information is safe; please try again in a moment.
        </p>
        <button type="button" className="service-retry-button" onClick={onRetry} disabled={checking}>
          <span aria-hidden="true">↻</span>{checking ? "Checking service…" : "Try again"}
        </button>
        <p className="service-status-hint">We’ll automatically reconnect when the service is restored.</p>
      </section>
    </main>
  );
}

export default function ServiceStatusGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ServiceState>("checking");

  const checkService = useCallback(async () => {
    setState("checking");
    setState((await isServiceAvailable()) ? "available" : "unavailable");
  }, []);

  useEffect(() => {
    void checkService();

    const handleUnavailable = () => void checkService();
    window.addEventListener("service-unavailable", handleUnavailable);
    window.addEventListener("online", handleUnavailable);
    return () => {
      window.removeEventListener("service-unavailable", handleUnavailable);
      window.removeEventListener("online", handleUnavailable);
    };
  }, [checkService]);

  useEffect(() => {
    if (state !== "unavailable") return;
    const retryTimer = window.setInterval(() => void checkService(), 30_000);
    return () => window.clearInterval(retryTimer);
  }, [checkService, state]);

  if (state === "available") return <>{children}</>;
  return <ServiceUnavailable onRetry={() => void checkService()} checking={state === "checking"} />;
}
