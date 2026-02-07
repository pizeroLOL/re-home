const iconMap = {
  playing: "⏸",
  pause: "▶",
  loading: "O",
} as const;
export default (props: {
  status: {
    paused: boolean;
    name: string;
    volume: number;
  };
  onVolumeChange: (value: number) => void;
  onPlayPause: () => void;
  onBackward: () => void;
  onForward: () => void;
}) => {
  return (
    <div class="grow text-center re-bg-blur rounded-xl p-2 grid items-center-safe justify-center-safe gap-1">
      <div class="text-ellipsis">{props.status.name}</div>
      <div class="text-3xl flex gap-2 *:w-fit *:text-center justify-center items-center-safe">
        <button onClick={() => props.onBackward()}>⏮️</button>
        <button onClick={() => props.onPlayPause()}>
          {props.status.paused ? "▶" : "⏸"}
        </button>
        <button onClick={() => props.onForward()}>⏭️</button>
      </div>
      <input
        type="range"
        step={1}
        min={0}
        max={100}
        class="block w-full"
        value={props.status.volume}
        onChange={(e) => props.onVolumeChange(Number(e.currentTarget.value))}
      />
    </div>
  );
};
