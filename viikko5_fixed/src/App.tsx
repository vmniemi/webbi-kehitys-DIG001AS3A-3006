import { useEffect, useRef, useState } from "react";
import "./App.css";

import LoginForm from "./LoginForm";
import ConsentBanner from "./components/ConsentBanner";

import { auth, logout } from "./authService";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getOrCreateCodename } from "./codenameService";
import { useCloudflareAnalytics } from "./hooks/useCloudflareAnalytics";

import {
  createSession,
  joinSession,
  subscribeSession,
} from "./gameSessionService";

import {
  resetGame,
  startGameIfPossible,
  submitGuess,
  clearPlayers,
  nextRound,
} from "./gameController";

import { QuizForm } from "./components/QuizForm";
import { type Session } from "./types/Session";
import { type Player } from "./types/Player";

function RouteAnalytics() {
  const { trackEvent } = useCloudflareAnalytics();

  const initialReferrer = useRef<string>(document.referrer || "direct");

  useEffect(() => {
    trackEvent("page_view", {
      referrer: initialReferrer.current,
      landingPath: window.location.pathname,
    });
  }, [trackEvent]);

  return null;
}

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

        const player: Player = {
          uid: firebaseUser.uid,
          codename: name,
          score: 0,
          guess: null,
        };

        await joinSession(player);
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
      console.error("Pelin aloitus epäonnistui:", err);
      setError("Pelin aloitus epäonnistui.");
    }
  }

  async function handleClearPlayers() {
    if (!confirm("Poistetaanko kaikki pelaajat?")) return;

    try {
      await clearPlayers();
    } catch (err) {
      console.error("Pelaajien tyhjennys epäonnistui:", err);
      setError("Pelaajien tyhjennys epäonnistui.");
    }
  }

  async function handleSubmitGuess(guess: number) {
    if (!user) return;

    try {
      await submitGuess(user.uid, guess);
    } catch (err) {
      console.error("Arvauksen lähetys epäonnistui:", err);
      setError("Arvauksen lähetys epäonnistui.");
    }
  }

  async function handleNextRound() {
    try {
      await nextRound();
    } catch (err) {
      console.error("Seuraavan kierroksen aloitus epäonnistui:", err);
      setError("Seuraavan kierroksen aloitus epäonnistui.");
    }
  }

  async function handleResetGame() {
    if (!confirm("Aloitetaanko peli alusta?")) return;

    try {
      await resetGame();
    } catch (err) {
      console.error("Pelin resetointi epäonnistui:", err);
      setError("Pelin resetointi epäonnistui.");
    }
  }

  return (
    <>
      <RouteAnalytics />
      <ConsentBanner />

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

              <button type="button" onClick={logout}>
                Kirjaudu ulos
              </button>

              {!session ? (
                <p>Ladataan pelisessiota...</p>
              ) : (
                <>
                  <h2>Pelisessio: {session.sessionName}</h2>
                  <p>Tila: {session.status}</p>
                  <p>
                    Kierros: {session.currentRound} / {session.maxRounds}
                  </p>

                  <h3>Pelaajat</h3>

                  {session.players.length === 0 ? (
                    <p>Ei pelaajia vielä.</p>
                  ) : (
                    <ul>
                      {session.players.map((player) => (
                        <li key={player.uid}>
                          {player.codename} — pisteet: {player.score}
                        </li>
                      ))}
                    </ul>
                  )}

                  {session.status === "waiting" && (
                    <>
                      <p>
                        Odotetaan pelaajia. Peli alkaa, kun mukana on vähintään
                        2 pelaajaa.
                      </p>

                      <p>Pelaajia nyt: {session.players.length} / 4</p>

                      <button type="button" onClick={handleClearPlayers}>
                        Tyhjennä pelaajat
                      </button>

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

                      <button type="button" onClick={handleResetGame}>
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
    </>
  );
}

export default App;