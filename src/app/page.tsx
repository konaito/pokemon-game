import { GameProvider } from "@/components/GameProvider";
import { Game } from "@/components/Game";

export default function Home() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
