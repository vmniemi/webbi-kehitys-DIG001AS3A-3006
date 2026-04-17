import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

const ADJECTIVES = [
  "Sneaky",
  "Fuzzy",
  "Wobbly",
  "Turbo",
  "Mighty",
  "Cheeky",
  "Shadow",
  "Bouncy",
  "Grumpy",
  "Cosmic",
  "Silent",
  "Electric",
  "Crimson",
  "Golden",
  "Rapid",
  "Stormy",
  "Phantom",
  "Lucky",
  "Wild",
  "Nimble",
  "Glitchy",
  "Quantum",
  "Velvet",
  "Frosty",
  "Burning",
  "Hidden",
  "Swift",
  "Clever",
  "Mystic",
];

const ANIMALS = [
  "Panda",
  "Otter",
  "Fox",
  "Koala",
  "Badger",
  "Raccoon",
  "Llama",
  "Penguin",
  "Ferret",
  "Hamster",
  "Wolf",
  "Tiger",
  "Eagle",
  "Falcon",
  "Shark",
  "Dragon",
  "Leopard",
  "Hawk",
  "Bear",
  "Cobra",
  "Panther",
  "Jaguar",
  "Gecko",
  "Raven",
  "Moose",
  "Bison",
  "Lynx",
  "Orca",
];

function randomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCodename(): string {
  const number = Math.floor(Math.random() * 9000) + 100;
  return `${randomItem(ADJECTIVES)}${randomItem(ANIMALS)}${number}`;
}

function getCodenameKey(uid: string): string {
  return `codename_${uid}`;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [codename, setCodename] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const key = getCodenameKey(firebaseUser.uid);
        let savedCodename = localStorage.getItem(key);

        if (!savedCodename) {
          savedCodename = generateCodename();
          localStorage.setItem(key, savedCodename);
        }

        setCodename(savedCodename);
      } else {
        setCodename("");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  function handleGenerateNewCodename() {
    if (!user) return;

    const key = getCodenameKey(user.uid);
    const newCodename = generateCodename();

    localStorage.setItem(key, newCodename);
    setCodename(newCodename);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (loading) {
    return (
      <main>
        <div className="card">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="card">
        <h1>Codename Generator</h1>

        {user ? (
          <>
            <p>Welcome, {user.email}</p>
            <p>Your codename is: <strong>{codename}</strong></p>

            <button className="button" onClick={handleGenerateNewCodename}>
              Generate New Codename
            </button>

            <button className="button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <p>Log in to see your codename.</p>
            <LoginForm />
          </>
        )}
      </div>
    </main>
  );
}