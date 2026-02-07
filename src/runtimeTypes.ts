import z from "zod";

export const MetingRsp = z
  .object({
    name: z.string(),
    artist: z.string(),
    url: z.url(),
    pic: z.url(),
    lrc: z.url(),
  })
  .array();
