import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  select,
  text,
} from "@clack/prompts";
import { access, constants, readdir, rm, writeFile } from "fs/promises";
import color from "picocolors";

const CONFIG_PATH = "config.json";
const DEFAULT_CONFIG: Config = {
  title: "网站标题",
  name: "你的名字",
  desc: "一句话描述你自己",
  link: [
    {
      name: "社交平台名称",
      icon: "/icon/<filename>",
      href: "https://example.com/",
    },
  ],
  site: [
    {
      name: "你的常用网站名称",
      icon: "/icon/<iconname>",
      href: "https://example.com/",
    },
  ],
  music: {
    autoplay: false,
    provider: "meting",
    url: "你的 Metting 歌曲列表 URL",
  },
};

const handleCancel = <T>(f: T | symbol) => {
  if (isCancel(f)) {
    cancel("已取消生成。");
    return process.exit(0);
  }
  return f;
};

const needText = (v: string | undefined) =>
  v !== undefined && v.length !== 0 ? undefined : "请输入文本";

async function main() {
  console.log();
  intro(color.inverse(" 生成配置文件 "));
  const hasConfig = await access(CONFIG_PATH, constants.R_OK)
    .then(() => true)
    .catch(() => false);
  if (hasConfig) {
    const wantDelete = await confirm({
      message: `已在 ${CONFIG_PATH} 检测到配置文件，是否重新配置？`,
      initialValue: false,
    }).then(handleCancel);
    if (!wantDelete) {
      cancel("已取消配置。");
      return;
    }
    await rm(CONFIG_PATH);
  }
  if (
    await select({
      message: "选择生成方式：",
      options: [
        {
          value: true,
          label: "使用默认配置文件",
        },
        {
          value: false,
          label: "使用交互式配置",
        },
      ],
    }).then(handleCancel)
  ) {
    await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, undefined, 2));
    log.message(
      "别忘了把 icon 放到 public/icon/<filename> 并在 icon 那一处写上 /icon/<filename>。",
    );
    outro(`已生成 ${CONFIG_PATH}`);
    return;
  }
  const title = await text({
    message: "网站标题是什么？",
    placeholder: "re-home",
    validate: needText,
  }).then(handleCancel);
  const name = await text({
    message: "你的名字是什么？",
    placeholder: "名字",
    validate: needText,
  }).then(handleCancel);
  const desc = await text({
    message: "尝试用一句话描述你自己：",
    placeholder: "我是一个天才。",
    validate: needText,
  }).then(handleCancel);
  while (
    !(await confirm({
      message: "你是否已经将所需的 icon 放入 public/icon 文件夹?",
    }).then(handleCancel))
  ) {
    log.info("请将所需的 icon 放入 public/icon 文件夹");
  }
  const icons = (
    await readdir("public/icon", {
      withFileTypes: true,
    })
  )
    .filter((it) => it.isFile())
    .map((it) => ({ value: `/icon/${it.name}`, label: it.name }))
    .concat({ value: "", label: "暂不使用 icon" });

  log.message("接下来输入你的社交网站信息：");
  const link = [] as LinkItem[];
  while (true) {
    const name = await text({ message: "网站名称：", validate: needText }).then(
      handleCancel,
    );
    const icon = await select({
      message: "网站的 icon：",
      options: icons,
    }).then(handleCancel);
    const href = await text({
      message: "直达你账户的链接:",
      validate: needText,
    }).then(handleCancel);
    link.push({ name, icon, href });
    if (
      !(await confirm({
        message: "继续填写社交网站信息？",
      }).then(handleCancel))
    ) {
      break;
    }
  }

  log.message("接下来输入你的常用网站信息：");
  const site = [] as SiteItem[];
  while (true) {
    const name = await text({ message: "网站名称：", validate: needText }).then(
      handleCancel,
    );
    const icon = await select({
      message: "网站的 icon：",
      options: icons,
    }).then(handleCancel);
    const href = await text({ message: "链接:", validate: needText }).then(
      handleCancel,
    );
    site.push({ name, icon, href });
    if (
      !(await confirm({
        message: "继续填写常用网站信息？",
      }).then(handleCancel))
    ) {
      break;
    }
  }
  const output: Config = { title, name, desc, link, site, music: undefined };
  if (
    await confirm({
      message: "启用音乐",
    }).then(handleCancel)
  ) {
    const autoplay = await confirm({
      message: "启用自动播放",
    }).then(handleCancel);
    const url = await text({
      message: "Meting 播放页 url",
      validate: needText,
    }).then(handleCancel);
    output.music = {
      autoplay,
      url,
      provider: "meting",
    };
  }
  await writeFile(CONFIG_PATH, JSON.stringify(output, undefined, 2));
  outro(`${CONFIG_PATH} 已生成。`);
}

main().catch(console.error);
