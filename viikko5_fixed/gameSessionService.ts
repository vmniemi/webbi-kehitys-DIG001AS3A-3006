import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "./authService";
import { type Session } from "./types/Session";
import { type Player } from "./types/Player";

export const SESSION_ID = "price-guessing-main-session";

function createInitialSession(): Session {
  return {
    id: SESSION_ID,
    sessionName: "Hintanarvauspeli",
    status: "waiting",
    players: [],
    currentRound: 1,
    maxRounds: 3,
    currentProduct: null,
    correctPrice: null,
    winnerCodename: null,
    createdAt: Date.now(),
  };
}

export async function createSession(): Promise<Session> {
  const sessionRef = doc(db, "sessions", SESSION_ID);
  const existing = await getDoc(sessionRef);

  if (existing.exists()) {
    return existing.data() as Session;
  }

  const session = createInitialSession();
  await setDoc(sessionRef, session);
  return session;
}

export async function saveSession(session: Session): Promise<void> {
  const sessionRef = doc(db, "sessions", session.id);
  await setDoc(sessionRef, session);
}

export async function getSession(): Promise<Session | null> {
  const sessionRef = doc(db, "sessions", SESSION_ID);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) return null;

  return snapshot.data() as Session;
}

export function subscribeSession(callback: (session: Session | null) => void) {
  const sessionRef = doc(db, "sessions", SESSION_ID);

  return onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback(snapshot.data() as Session);
  });
}

export async function joinSession(player: Player): Promise<void> {
  const sessionRef = doc(db, "sessions", SESSION_ID);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(sessionRef);
    const session = snapshot.exists()
      ? (snapshot.data() as Session)
      : createInitialSession();

    const alreadyJoined = session.players.some((p) => p.uid === player.uid);
    if (alreadyJoined) return;

    if (session.players.length >= 4) {
      throw new Error("Peli on täynnä. Enintään 4 pelaajaa.");
    }

    if (session.status !== "waiting") {
      throw new Error("Peli on jo käynnissä.");
    }

    transaction.set(sessionRef, {
      ...session,
      players: [...session.players, player],
    });
  });
}
