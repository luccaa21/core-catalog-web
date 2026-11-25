import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";

export const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});
