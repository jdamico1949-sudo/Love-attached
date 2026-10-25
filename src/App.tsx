import { useState } from "react";
import { useStore } from "./store";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { HomeScreen } from "./components/HomeScreen";
import { TreasureForm } from "./components/TreasureForm";
import { GiftBookletPage } from "./components/GiftBooklet";
import { FamilyListPage } from "./components/FamilyList";
import { FinalizeScreen } from "./components/FinalizeScreen";

type Screen = "home" | "form" | "booklet" | "familylist" | "finalize" | "welcome";

export default function App() {
  const { state, loaded, addTreasure, dismissWelcome } = useStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTreasureId, setActiveTreasureId] = useState<string | null>(null);

  if (!loaded) return null;

  function handleAddTreasure() {
    const t = addTreasure({ signedAs: state.lastSignedAs });
    setActiveTreasureId(t.id);
    setScreen("form");
  }

  function handleStartFromWelcome() {
    dismissWelcome();
    handleAddTreasure();
  }

  if (screen === "welcome" || (!state.dismissedWelcome && state.treasures.length === 0 && screen === "home")) {
    return <WelcomeScreen onStart={handleStartFromWelcome} embedded={state.dismissedWelcome} />;
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

  if (screen === "booklet") return <GiftBookletPage onBack={() => setScreen("home")} />;
  if (screen === "familylist") return <FamilyListPage onBack={() => setScreen("home")} />;
  if (screen === "finalize") return <FinalizeScreen onBack={() => setScreen("home")} />;

  return (
    <HomeScreen
      onAdd={handleAddTreasure}
      onOpen={(id) => {
        setActiveTreasureId(id);
        setScreen("form");
      }}
      onBooklet={() => setScreen("booklet")}
      onFamilyList={() => setScreen("familylist")}
      onFinalize={() => setScreen("finalize")}
      onHowItWorks={() => setScreen("welcome")}
    />
  );
}
