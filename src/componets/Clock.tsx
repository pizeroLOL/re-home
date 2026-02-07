import { createMemo, from } from "solid-js";

export default () => {
  const timer = from((set) => {
    const time = setInterval(() => {
      set(new Date());
    }, 1000);
    return () => clearInterval(time);
  }, new Date());
  const letPad = (n: number) => n.toString().padStart(2, "0");

  const date = createMemo(
    () =>
      `${timer().getFullYear()} 年 ${timer().getMonth() + 1} 月 ${timer().getDate()} 日`,
  );
  const time = createMemo(
    () =>
      `${letPad(timer().getHours())}:${letPad(timer().getMinutes())}:${letPad(timer().getSeconds())}`,
  );
  const weekday = createMemo(
    () => `星期${["日", "一", "二", "三", "四", "五", "六"][timer().getDay()]}`,
  );
  return (
    <div class="grow text-center re-bg-blur rounded-xl p-2 grid gap-1">
      <div>{date()}</div>
      <div class="text-3xl font-mono">{time()}</div>
      <div>{weekday()}</div>
    </div>
  );
};
