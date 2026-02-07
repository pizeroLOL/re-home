import { createSignal, For } from "solid-js";
import { config } from "../assets.ts";
import { DOMElement } from "solid-js/jsx-runtime";

export default () => {
  const ITEM_PRE_BUCKET = 6;
  const blocksBuckets = config.site.reduce((acc, now, id) => {
    if (id % ITEM_PRE_BUCKET == 0) {
      acc.push([] as SiteItem[]);
    }
    acc[Math.floor(id / ITEM_PRE_BUCKET)].push(now);
    return acc;
  }, [] as SiteItem[][]);
  const toA = (it: SiteItem) => (
    <a
      class="re-bg-blur p-4 rounded-xl dark:hover:bg-neutral-900 hover:bg-neutral-100 transition flex justify-center-safe items-center-safe text-center gap-2"
      href={it.href}
    >
      {/*TODO: icon support*/}
      {/*<img alt="" class="w-4 min-h-4" src={it.icon}></img>*/}
      <div>{it.name}</div>
    </a>
  );
  const toBucketBox = (it: SiteItem[]) => (
    <section
      class="grid gap-2 grid-cols-3 grid-rows-2 shrink-0 w-full
      "
    >
      <For each={it} children={toA} />
    </section>
  );
  const [index, setIndex] = createSignal(0);
  const onScroll = (
    e: Event & {
      currentTarget: HTMLElement;
      target: DOMElement;
    },
  ) => {
    setIndex(
      Math.floor(
        e.currentTarget.scrollLeft /
          e.currentTarget.getBoundingClientRect().width,
      ),
    );
  };
  const onWheel = (
    e: WheelEvent & {
      currentTarget: HTMLElement;
      target: DOMElement;
    },
  ) => {
    if (e.deltaY == 0) {
      return;
    }
    scrollBox.scrollTo({
      behavior: "smooth",
      left:
        e.currentTarget.getBoundingClientRect().width *
        (e.deltaY > 0
          ? Math.min(index() + 1, blocksBuckets.length - 1)
          : Math.max(index() - 1, 0)),
    });
  };
  const scrollBox = (
    <section
      class="flex gap-2 overflow-x-auto snap-mandatory scroll-bar-none snap-x *:snap-start snap-always"
      onScroll={onScroll}
      onWheel={onWheel}
    >
      <For each={blocksBuckets} children={toBucketBox}></For>
    </section>
  ) as HTMLElement;
  const onClick =
    (id: number) =>
    (
      e: MouseEvent & {
        currentTarget: HTMLButtonElement;
        target: DOMElement;
      },
    ) => {
      console.log("?");
      scrollBox.scrollTo({
        behavior: "smooth",
        left: id * scrollBox.getBoundingClientRect().width,
      });
    };
  return (
    <section class="grid gap-1">
      {scrollBox}
      {blocksBuckets.length <= 1 || (
        <section class="flex justify-center-safe items-center-safe gap-1 ">
          <For
            each={blocksBuckets}
            children={(_, id) => (
              <button
                aria-checked={id() == index()}
                class="w-4 rounded-full h-2 re-bg-blur aria-checked:bg-neutral-100 dark:aria-checked:bg-neutral-900"
                onClick={onClick(id())}
              ></button>
            )}
          ></For>
        </section>
      )}
    </section>
  );
};
