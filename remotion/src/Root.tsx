import { Composition } from "remotion";
import { PV } from "./PV";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PV"
      component={PV}
      durationInFrames={2700}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
