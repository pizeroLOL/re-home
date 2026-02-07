declare type LinkItem = {
  icon: string;
  name: string;
  href: string;
};

declare type SiteItem = {
  icon: string;
  name: string;
  href: string;
};

declare type MusicSettings = {
  autoplay: boolean;
  provider: "meting";
  url: string;
};

declare type Config = {
  title: string;
  name: string;
  desc: string;
  link: LinkItem[];
  site: SiteItem[];
  music: MusicSettings;
};
