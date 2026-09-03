export type Logo = {
  alt?: string;
  height: number;
  name: string;
  src: string;
  width: number;
};

export const fallbackLogos: Logo[] = [
  { name: "Taskpin", src: "/logos/taskpin.svg", width: 86, height: 20 },
  {
    name: "VisionSpring",
    src: "/logos/visionspring.svg",
    width: 114,
    height: 24,
  },
  { name: "BIMA", src: "/logos/bima.svg", width: 105, height: 26 },
  {
    name: "Simply Real Market",
    src: "/logos/simplyrealmarket.svg",
    width: 70,
    height: 28,
  },
  {
    name: "Musemind",
    src: "/logos/musemind.svg",
    width: 108,
    height: 16,
  },
  {
    name: "Grameenphone",
    src: "/logos/grameenphone.svg",
    width: 120,
    height: 24,
  },
  { name: "Gofo", src: "/logos/gofo.svg", width: 69, height: 12 },
];
