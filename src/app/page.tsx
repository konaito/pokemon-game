import { GameProvider } from "@/components/GameProvider";
import { Game } from "@/components/Game";

export default function Home() {
  return (
    <div className="game-outer">
      <div className="game-container">
        <GameProvider>
          <Game />
        </GameProvider>
      </div>
    </div>
  );
}
