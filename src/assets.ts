import ConfigFile from "../config.json";

if (
  ConfigFile.music !== undefined &&
  ConfigFile.music?.provider !== "meting" &&
  ConfigFile.music?.provider !== "nano-meting"
) {
  throw new Error("不支持其他提供者");
}

export const config = ConfigFile as Config;
