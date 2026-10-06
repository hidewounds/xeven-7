import { createRoot } from "react-dom/client";
import { useEffect, useSyncExternalStore } from "react";
import { currentRoute, subscribeRoute } from "./navigation";
import { ROUTES } from "./routes";
import { ExperienceProvider } from "@/components/experience-shell";
import ContinuousHome from "@/components/continuous-home";
import PlatformPage from "@/components/platform-page";
import AboutPage from "@/components/about-page";
import PlansPage from "@/components/plans-page";
import DemoPage from "@/components/demo-page";
import ContactPage from "@/components/contact-page";
import "@/app/globals.css";

const pages = {
  "/": ContinuousHome,
  "/platform": PlatformPage,
  "/about": AboutPage,
  "/plans": PlansPage,
  "/demo": DemoPage,
  "/contact": ContactPage,
};
function App() {
  const route = useSyncExternalStore(
    subscribeRoute,
    currentRoute,
    () => "/" as const,
  );
  useEffect(() => {
    // The tab always reads XEVEN, on every route.
    document.title = "XEVEN";
  }, [route]);
  const Page = pages[route] || ContinuousHome;
  return (
    <ExperienceProvider>
      <Page key={route} />
    </ExperienceProvider>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
