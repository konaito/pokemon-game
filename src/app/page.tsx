import { GameProvider } from "@/components/GameProvider";
import { AudioProvider } from "@/components/AudioProvider";
import { Game } from "@/components/Game";

export default function Home() {
  return (
    <div className="game-outer">
      <div className="game-container">
        <AudioProvider>
          <GameProvider>
            <Game />
          </GameProvider>
        </AudioProvider>
      </div>
    </div>
  );
}
