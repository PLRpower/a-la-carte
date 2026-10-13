import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { initAnalytics } from "./lib/analytics";

initSentry();
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
