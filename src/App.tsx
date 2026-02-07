import type { Accessor, Component, Setter } from "solid-js";
import {
  For,
  createComputed,
  createEffect,
  createMemo,
  createReaction,
  createRenderEffect,
  createResource,
  createSignal,
} from "solid-js";
import { DOMElement } from "solid-js/jsx-runtime";
import { config } from "./assets.ts";
import Clock from "./componets/Clock.tsx";
import LinkView from "./componets/LinkView.tsx";
import PlayerControler from "./componets/PlayerControler.tsx";
import { MetingRsp } from "./runtimeTypes.ts";
import z from "zod";

const onSearch = (
  ev: KeyboardEvent & {
    currentTarget: HTMLInputElement;
    target: DOMElement;
  },
) => {
  if (ev.isComposing || ev.code !== "Enter") {
    return;
  }
  const url = new URL("https://cn.bing.com/search");
  const search = new URLSearchParams();
  search.set("q", ev.currentTarget.value);
  url.search = search.toString();
  location.assign(url);
};

function fetchPlaylist(url: string) {
  return fetch(url)
    .then((i) => i.json())
    .then((i) => MetingRsp.parseAsync(i));
}

const App: Component = () => {
  createEffect(() => (document.title = config.title));
  const [playlist, setPlaylist] = createSignal(
    undefined as z.infer<typeof MetingRsp> | undefined,
  );

  const [index, setIndex] = createSignal(undefined as number | undefined);
  config.music?.url !== undefined &&
    fetchPlaylist(config.music.url).then((i) => {
      setPlaylist(i);
      setIndex(
        i.length === 0 ? undefined : Math.floor(Math.random() * i.length),
      );
    });
  const currentInfo = createMemo(() => {
    const pl = playlist();
    const id = index();
    return pl?.length === undefined ||
      pl.length === 0 ||
      id === undefined ||
      pl.length <= id
      ? undefined
      : pl[id];
  });
  const src = createMemo(() => currentInfo()?.url);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const trackSrc = createReaction(() => audioEle.play());
  if (config.music?.autoplay ?? false) {
    trackSrc(() => src());
  }
  const audioEle = (
    <audio
      class="hidden"
      src={src()}
      onPlay={(e) => {
        setIsPlaying(!e.currentTarget.paused);
      }}
      onPause={(e) => {
        setIsPlaying(!e.currentTarget.paused);
      }}
      onEnded={() => nextSong(playlist, setIndex, audioEle)}
    ></audio>
  ) as HTMLAudioElement;
  return (
    <>
      <div class="min-h-dvh flex flex-col items-center-safe justify-center-safe p-2 pb-10">
        <main class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center-safe justify-center-safe w-fit">
          <section class="flex flex-col gap-2 w-full">
            <div class="grow"></div>
            <h1 class="text-7xl font-black re-no-bg-text">{config.name}</h1>
            <input
              type="search"
              placeholder="Q 输入以搜索"
              class="block re-bg-blur px-2 py-1 rounded-xl "
              onKeyUp={onSearch}
            />
            <section class="re-bg-blur p-6 min-h-24 rounded-xl relative justify-center-safe content-center-safe ">
              <div class="text-3xl absolute left-2 top-0.5">❝</div>
              {config.desc}
              <div class="text-3xl absolute right-2 -bottom-1.75">❞</div>
            </section>
            <section class="flex gap-2">
              <For
                each={config.link}
                children={(it) => (
                  <a
                    href={it.href}
                    class="re-bg-blur rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition grid justify-center-safe content-center-safe p-2 min-w-8 h-8"
                  >
                    <img src={it.icon} alt={it.name} class="block h-4"></img>
                  </a>
                )}
              ></For>
            </section>
          </section>
          <section class="flex flex-col gap-4 w-fit max-w-100">
            <section class="grid grid-cols-2 gap-2 h-fit">
              <Clock></Clock>
              <PlayerControler
                onBackward={() => {
                  const pl = playlist();
                  setIndex((a) =>
                    a === undefined ||
                    pl?.length === undefined ||
                    pl.length === 0
                      ? undefined
                      : a - 1 < 0
                        ? pl.length - 1
                        : a - 1,
                  );
                  audioEle.play();
                }}
                onForward={() => nextSong(playlist, setIndex, audioEle)}
                onVolumeChange={(v) => (audioEle.volume = v / 100)}
                onPlayPause={() =>
                  audioEle.paused ? audioEle.play() : audioEle.pause()
                }
                status={{
                  paused: !isPlaying(),
                  name: currentInfo()?.name ?? "暂无名称",
                  volume: audioEle.volume * 100,
                }}
              ></PlayerControler>
            </section>
            <section class="grid gap-2">
              <h2 class="text-4xl font-semibold re-no-bg-text">常用网站</h2>
              <LinkView></LinkView>
            </section>
          </section>
        </main>
      </div>
      <div class="re-bg-blur h-8 w-dvw fixed bottom-0 justify-center-safe content-center-safe items-center-safe text-center">
        pizeroLOL/re-home
      </div>
      {audioEle}
    </>
  );
};

export default App;
function nextSong(
  playlist: Accessor<z.infer<typeof MetingRsp> | undefined>,
  setIndex: Setter<number | undefined>,
  audioEle: HTMLAudioElement,
): void {
  const pl = playlist();
  setIndex((a) =>
    a === undefined || pl?.length === undefined || pl.length === 0
      ? undefined
      : a + 1 >= pl.length
        ? 0
        : a + 1,
  );
  audioEle.play();
}
