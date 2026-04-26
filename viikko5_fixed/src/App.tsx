import { useEffect, useState } from "react";
import "./App.css";
import LoginForm from "../LoginForm";
import { auth, logout } from "../authService";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getOrCreateCodename } from "../codenameService";
import {
  createSession,
  joinSession,
  subscribeSession,
} from "../gameSessionService";
import {
  resetGame,
  startGameIfPossible,
  submitGuess,
  clearPlayers,
  nextRound,
} from "../gameController";
import { QuizForm } from "../components/QuizForm";
import { type Session } from "../types/Session";
import { type Player } from "../types/Player";


function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [codename, setCodename] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
    setUser(firebaseUser);
    setError("");

    if (!firebaseUser) {
      setCodename("");
      setSession(null);
      return;
    }

    try {
      const name = getOrCreateCodename(firebaseUser.uid);
      setCodename(name);

      await createSession();

      await joinSession({
        uid: firebaseUser.uid,
        codename: name,
        score: 0,
        guess: null,
      });
    } catch (err) {
      console.error("Peliin liittyminen epäonnistui:", err);
      setError("Peliin liittyminen epäonnistui.");
    }
  });

  return () => unsubscribeAuth();
}, []);

useEffect(() => {
  if (!user) return;

  const unsubscribeSession = subscribeSession((updatedSession) => {
    setSession(updatedSession);
  });

  return () => unsubscribeSession();
}, [user]);

  async function handleStartGame() {
    if (!session) return;

    try {
      await startGameIfPossible(session);
    } catch (err) {
      console.error(err);
      setError("Pelin aloitus epäonnistui.");
    }
  }
async function handleClearPlayers() {
  if (!confirm("Poistetaanko kaikki pelaajat?")) return;

  try {
    await clearPlayers();
  } catch (err) {
    console.error("Clear players failed:", err);
  }
}

async function handleSubmitGuess(guess: number) {
  if (!user) return;

    try {
      await submitGuess(user.uid, guess);
    } catch (err) {
      console.error(err);
      setError("Arvauksen lähetys epäonnistui.");
    }
  }

  async function handleNextRound() {
    try {
      await nextRound();
    } catch (err) {
      console.error(err);
      setError("Seuraavan kierroksen aloitus epäonnistui.");
    }
  }
async function handleResetGame() {
  try {
    await resetGame();
  } catch (err) {
    console.error("Reset failed:", err);
  }
}
  return (
    <main className="app">
      <section className="card">
        <h1>Hintanarvauspeli</h1>

        {error && <p className="error">{error}</p>}

        {!user ? (
          <>
            <p>Kirjaudu sisään pelataksesi.</p>
            <LoginForm />
          </>
        ) : (
          <>
            <p>
               Tervetuloa, <strong>{codename}</strong>
            </p>
            <button type="button" onClick={logout}>Kirjaudu ulos</button>

            {!session ? (
              <p>Ladataan pelisessiota...</p>
            ) : (
              <>
                <h2>Pelisessio: {session.sessionName}</h2>
                <p>Tila: {session.status}</p>
                <p>Kierros: {session.currentRound} / {session.maxRounds}</p>

                <h3>Pelaajat</h3>
                <ul>
                  {session.players.map((player) => (
                    <li key={player.uid}>
                      {player.codename} — pisteet: {player.score}
                    </li>
                  ))}
                </ul>

                {session.status === "waiting" && (
                  <>
                    <p>
                      Odotetaan pelaajia. Peli alkaa, kun mukana on vähintään 2
                      pelaajaa.
                    </p>
                    <button onClick={handleClearPlayers}>
                     Tyhjennä pelaajat
                    </button>
                    <p>Pelaajia nyt: {session.players.length} / 4</p>
                    <button
                      type="button"
                      onClick={handleStartGame}
                      disabled={session.players.length < 2}
                    >
                      Aloita peli
                    </button>
                  </>
                )}

                {session.status === "playing" && (
                  <QuizForm
                    players={session.players}
                    currentUserId={user.uid}
                    currentProduct={session.currentProduct}
                    correctPrice={session.correctPrice}
                    onSubmitGuess={handleSubmitGuess}
                    onNextRound={handleNextRound}
                  />
                )}

                {session.status === "finished" && (
                  <div>
                    <h2>Peli päättyi</h2>
                    <p>Voittaja: {session.winnerCodename}</p>
                     <button onClick={handleResetGame}>
                      Aloita alusta
                     </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
