import { type Player } from "../types/Player";

type RoundResultProps = {
  players: Player[];
  correctPrice: number;
  onNextRound: () => void;
};

export function RoundResult({
  players,
  correctPrice,
  onNextRound,
}: RoundResultProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    const aDiff = Math.abs((a.guess ?? 0) - correctPrice);
    const bDiff = Math.abs((b.guess ?? 0) - correctPrice);
    return aDiff - bDiff;
  });

  return (
    <div className="result-card">
      <h2>Kierroksen tulos</h2>

      <p>Oikea hinta: <strong>{correctPrice} €</strong></p>

      <ul>
        {sortedPlayers.map((player) => (
          <li key={player.uid}>
            {player.codename}: {player.guess} € — ero{" "}
            {Math.abs((player.guess ?? 0) - correctPrice)} € — pisteet{" "}
            {player.score}
          </li>
        ))}
      </ul>

      <button onClick={onNextRound}>Seuraava kierros</button>
    </div>
  );
}