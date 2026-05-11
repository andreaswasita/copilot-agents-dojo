import { BrowserRouter, Routes, Route } from "react-router";
import { DojoHeader } from "./components/DojoHeader.js";
import { Home } from "./pages/Home.js";
import { SkillBrowser } from "./pages/SkillBrowser.js";
import { SkillDetail } from "./pages/SkillDetail.js";
import { AgentBrowser } from "./pages/AgentBrowser.js";
import { AgentDetail } from "./pages/AgentDetail.js";
import { Profiles } from "./pages/Profiles.js";
import { Install } from "./pages/Install.js";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <DojoHeader />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/skills" element={<SkillBrowser />} />
            <Route path="/skills/:slug" element={<SkillDetail />} />
            <Route path="/agents" element={<AgentBrowser />} />
            <Route path="/agents/:slug" element={<AgentDetail />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/install" element={<Install />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
