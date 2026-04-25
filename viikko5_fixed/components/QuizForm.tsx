import { useState } from "react";
import { type Player } from "../types/Player";
import { type Product } from "../types/Product";
import { RoundResult } from "./RoundResult";

type QuizFormProps = {
  players: Player[];
  currentUserId: string;
  currentProduct: Product | null;
  correctPrice: number | null;
  onSubmitGuess: (guess: number) => void;
  onNextRound: () => void;
};

export function QuizForm({
  players,
  currentUserId,
  currentProduct,
  correctPrice,
  onSubmitGuess,
  onNextRound,
}: QuizFormProps) {
  const [guess, setGuess] = useState("");

  const currentPlayer = players.find((player) => player.uid === currentUserId);
  const hasGuessed = Boolean(currentPlayer && currentPlayer.guess !== null);

  if (!currentProduct) {
    return <p>Odotetaan tuotetta...</p>;
  }

  if (correctPrice !== null) {
    return (
      <RoundResult
        players={players}
        correctPrice={correctPrice}
        onNextRound={onNextRound}
      />
    );
  }

  return (
    <div className="quiz-card">
      <h2>Arvaa tuotteen hinta</h2>
      <p>
        Tuote: <strong>{currentProduct.title}</strong>
      </p>

      {currentProduct.thumbnail && (
        <img
          src={currentProduct.thumbnail}
          alt={currentProduct.title}
          width="160"
        />
      )}

      {hasGuessed ? (
        <p>Olet jo arvannut: {currentPlayer?.guess} €</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmitGuess(Number(guess));
            setGuess("");
          }}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            placeholder="Arvaa hinta (€)"
            required
          />

          <button type="submit">Lähetä arvaus</button>
        </form>
      )}
    </div>
  );
}
