import { useState } from "react";
import { useStore } from "./store";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { HomeScreen } from "./components/HomeScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { TreasureForm } from "./components/TreasureForm";
import { GiftBookletPage } from "./components/GiftBooklet";
import { FamilyListPage } from "./components/FamilyList";
import { FinalizeScreen } from "./components/FinalizeScreen";

type Screen = "home" | "summary" | "form" | "booklet" | "familylist" | "finalize" | "welcome";

export default function App() {
  const { state, loaded, addTreasure, setSkipIntro } = useStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTreasureId, setActiveTreasureId] = useState<string | null>(null);
  // Where "← Back" on the booklet should land -- Home normally, but the
  // summary page's own "Print Book" shortcut should return there instead
  // of bouncing back to Home.
  const [bookletReturnScreen, setBookletReturnScreen] = useState<"home" | "summary">("home");
  // Which person's booklet to open straight to -- set when a specific
  // person's print button is tapped on Summary; undefined for the
  // general "Print Book"/"Print a gift booklet" entry points, which fall
  // back to whoever's first.
  const [bookletPersonId, setBookletPersonId] = useState<string | undefined>(undefined);
  // Separate from dismissedWelcome (which only controls whether the
  // *next* fresh unlock shows this screen): once Welcome has been
  // passed through this session, screen reverting to "home" afterward
  // must never re-trigger it -- even if the person just unchecked "skip
  // this next time" while reviewing it, which should take effect next
  // time, not trap them on this screen right now.
  const [passedIntroThisSession, setPassedIntroThisSession] = useState(false);

  if (!loaded) return null;

  function handleAddTreasure() {
    // Prefills with whoever signed the last treasure, instead of
    // starting blank every time -- that blank start is why the same
    // book used to end up signed inconsistently, page to page.
    const t = addTreasure({ signedBy: state.lastSignedBy });
    setActiveTreasureId(t.id);
    setScreen("form");
  }

  // Shown after every fresh unlock (login) unless the "skip this next
  // time" box had been checked on a previous visit -- not tied to
  // whether any treasures exist, so it isn't just a one-time first-run
  // screen. Also reachable any time via "How it works" from Home
  // (screen==="welcome" explicitly), independent of the gating check.
  if (screen === "welcome" || (!state.dismissedWelcome && !passedIntroThisSession && screen === "home")) {
    return (
      <WelcomeScreen
        skipChecked={state.dismissedWelcome}
        onContinue={(skipNextTime) => {
          setSkipIntro(skipNextTime);
          setPassedIntroThisSession(true);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "form" && activeTreasureId) {
    const treasure = state.treasures.find((t) => t.id === activeTreasureId);
    if (treasure) {
      return (
        <TreasureForm
          treasure={treasure}
          onDone={() => {
            setScreen("home");
            setActiveTreasureId(null);
          }}
        />
      );
    }
  }

  if (screen === "summary") {
    return (
      <SummaryScreen
        onBack={() => setScreen("home")}
        onAdd={handleAddTreasure}
        onOpen={(id) => {
          setActiveTreasureId(id);
          setScreen("form");
        }}
        onPrintBooklet={(personId) => {
          setBookletReturnScreen("summary");
          setBookletPersonId(personId);
          setScreen("booklet");
        }}
      />
    );
  }

  if (screen === "booklet")
    return <GiftBookletPage onBack={() => setScreen(bookletReturnScreen)} initialPersonId={bookletPersonId} />;
  if (screen === "familylist") return <FamilyListPage onBack={() => setScreen("home")} />;
  if (screen === "finalize") return <FinalizeScreen onBack={() => setScreen("home")} />;

  return (
    <HomeScreen
      onAdd={handleAddTreasure}
      onSummary={() => setScreen("summary")}
      onBooklet={() => {
        setBookletReturnScreen("home");
        setBookletPersonId(undefined);
        setScreen("booklet");
      }}
      onFamilyList={() => setScreen("familylist")}
      onFinalize={() => setScreen("finalize")}
      onHowItWorks={() => setScreen("welcome")}
    />
  );
}
