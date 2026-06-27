/* ============================================================
   BewerbungsKI — App root + router + tweaks
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#06b6d4",
  "primary": "#1e3a5f",
  "font": "Geist",
  "radius": 10
}/*EDITMODE-END*/;

function PricingPage() {
  const { navigate } = useStore();
  return (
    <div className="landing">
      <LandingNav />
      <div style={{ paddingTop: 40 }}><Pricing standalone /></div>
      <Footer />
    </div>
  );
}

function Router() {
  const { route } = useStore();
  const map = {
    landing: LandingPage,
    login: LoginPage,
    register: RegisterPage,
    dashboard: Dashboard,
    neu: NeueBewerbung,
    detail: BewerbungDetail,
    lebenslauf: Lebenslauf,
    profil: Profil,
    pricing: PricingPage,
  };
  const Page = map[route.name] || LandingPage;
  return <Page key={route.name + JSON.stringify(route.params)} />;
}

function applyTweaks(t) {
  const root = document.documentElement;
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--accent-500", t.accent);
  root.style.setProperty("--primary", t.primary);
  root.style.setProperty("--navy-700", t.primary);
  const fonts = {
    Geist: '"Geist","Inter",-apple-system,sans-serif',
    Inter: '"Inter",-apple-system,sans-serif',
    System: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  };
  root.style.setProperty("--font", fonts[t.font] || fonts.Geist);
  root.style.setProperty("--r", t.radius + "px");
  root.style.setProperty("--r-md", (t.radius + 2) + "px");
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);
  return (
    <StoreProvider>
      <ToastProvider>
        <Router />
        <TweaksPanel>
          <TweakSection label="Akzentfarbe" />
          <TweakColor label="Akzent" value={t.accent}
            options={["#06b6d4","#0ea5e9","#14b8a6","#6366f1","#8b5cf6"]}
            onChange={(v) => setTweak("accent", v)} />
          <TweakSection label="Primärfarbe" />
          <TweakColor label="Primär (Navy)" value={t.primary}
            options={["#1e3a5f","#0f2440","#1e293b","#312e81","#134e4a"]}
            onChange={(v) => setTweak("primary", v)} />
          <TweakSection label="Typografie" />
          <TweakRadio label="Schrift" value={t.font} options={["Geist","Inter","System"]}
            onChange={(v) => setTweak("font", v)} />
          <TweakSection label="Form" />
          <TweakSlider label="Eckenradius" value={t.radius} min={4} max={18} step={1} unit="px"
            onChange={(v) => setTweak("radius", v)} />
        </TweaksPanel>
      </ToastProvider>
    </StoreProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
