import { useEffect, useState } from "react";

const ADJECTIVES = [
  "Sneaky", "Fuzzy", "Wobbly", "Turbo", "Mighty", "Cheeky", "Shadow", "Bouncy",
  "Grumpy", "Cosmic", "Silent", "Electric", "Crimson", "Golden", "Rapid",
  "Stormy", "Phantom", "Lucky", "Wild", "Nimble", "Glitchy", "Quantum",
  "Velvet", "Frosty", "Burning", "Hidden", "Swift", "Clever", "Mystic"
];

const ANIMALS = [
  "Panda", "Otter", "Fox", "Koala", "Badger", "Raccoon", "Llama", "Penguin",
  "Ferret", "Hamster", "Wolf", "Tiger", "Eagle", "Falcon", "Shark",
  "Dragon", "Leopard", "Hawk", "Bear", "Cobra", "Panther", "Jaguar",
  "Gecko", "Raven", "Moose", "Bison", "Lynx", "Orca"
];

const KEY = "codename";

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCodename() {
  const number = Math.floor(Math.random() * 9000) + 100;
  return `${randomItem(ADJECTIVES)}${randomItem(ANIMALS)}${number}`;
}

export default function App() {
  const [step, setStep] = useState("loading");
  const [codename, setCodename] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);

    if (saved) {
      setCodename(saved);
      setStep("login");
    } else {
      setStep("create");
    }
  }, []);

  function handleCreateCodename() {
    const newName = generateCodename();
    localStorage.setItem(KEY, newName);
    setCodename(newName);
    setStep("login");
  }

function handleLogin() {
  let saved = localStorage.getItem(KEY);

  if (!saved) {
    saved = generateCodename();
    localStorage.setItem(KEY, saved);
  }

  setCodename(saved);
  setStep("dashboard");
}

  function handleLogout() {
    setStep("login");
  }

  function handleReset() {
    const newName = generateCodename();
    localStorage.setItem(KEY, newName);
    setCodename(newName);
  }

  if (step === "loading") return null;

  return (
    <main>
      <div className="card">
        <h1>Codename Generator</h1>

        {step === "create" && (
          <>
            <p>Welcome! You need to create your codename first.</p>
            <button className="button" onClick={handleCreateCodename}>
              Create Codename
            </button>
          </>
        )}

        {step === "login" && (
          <>
            <p>Your codename has been created. Log in to view it.</p>
            <button className="button" onClick={handleLogin}>
              Log In
            </button>
          </>
        )}

        {step === "dashboard" && (
          <>
            <p>You are logged in as:</p>
            <div className="codename">{codename}</div>

            <button className="button" onClick={handleReset}>
              Generate New Codename
            </button>

            <button className="button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </div>
    </main>
  );
}