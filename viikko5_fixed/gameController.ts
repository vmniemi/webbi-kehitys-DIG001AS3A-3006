import { type Session } from "./types/Session";
import { fetchRandomProduct } from "./productService";
import { saveSession, getSession } from "./gameSessionService";

export async function startGameIfPossible(session: Session): Promise<void> {
  if (session.status !== "waiting") return;
  if (session.players.length < 2) {
    throw new Error("Peli vaatii vähintään 2 pelaajaa.");
  }

  const product = await fetchRandomProduct();

  await saveSession({
    ...session,
    status: "playing",
    currentProduct: product,
    correctPrice: null,
    players: session.players.map((player) => ({
      ...player,
      guess: null,
    })),
  });
}

export async function submitGuess(uid: string, guess: number): Promise<void> {
  const session = await getSession();

  if (!session) return;
  if (session.status !== "playing") return;
  if (!session.currentProduct) return;

  const updatedPlayers = session.players.map((player) =>
    player.uid === uid ? { ...player, guess } : player
  );

  const allGuessed =
    updatedPlayers.length >= 2 &&
    updatedPlayers.every((player) => player.guess !== null);

  let updatedSession: Session = {
    ...session,
    players: updatedPlayers,
  };

  if (allGuessed) {
    const correctPrice = session.currentProduct.price;

    const playersWithScores = updatedPlayers.map((player) => {
      const difference = Math.abs((player.guess ?? 0) - correctPrice);
      const points = Math.max(0, 100 - difference);

      return {
        ...player,
        score: player.score + points,
      };
    });

    updatedSession = {
      ...updatedSession,
      players: playersWithScores,
      correctPrice,
    };
  }

  await saveSession(updatedSession);
}

export async function nextRound(): Promise<void> {
  const session = await getSession();

  if (!session) return;

  if (session.currentRound >= session.maxRounds) {
    const winner = [...session.players].sort((a, b) => b.score - a.score)[0];

    await saveSession({
      ...session,
      status: "finished",
      winnerCodename: winner?.codename ?? null,
    });

    return;
  }

  const product = await fetchRandomProduct();

  await saveSession({
    ...session,
    currentRound: session.currentRound + 1,
    currentProduct: product,
    correctPrice: null,
    players: session.players.map((player) => ({
      ...player,
      guess: null,
    })),
  });
}
