// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true; // noLink will create a route segment (section) but cannot be navigated
  items?: EachRoute[];
  tag?: string;
};

export const DOC_ROUTES: EachRoute[] = [
  {
    title: "Getting Started",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "Introduction", href: "/introduction" },
      { title: "Installation", href: "/installation" },
      { title: "Creating a Window", href: "/create-window" },
    ],
  },
  {
    title: "Manual",
    href: "/manual",
    noLink: true,
    items: [
      { title: "Constants", href: "/constants" },
    ],
  },
  {
    title: "Classes",
    href: "/classes",
    noLink: true,
    items: [
      { title: "AnimationController", href: "/animation-controller" },
      { title: "Audio", href: "/audio" },
      { title: "AudioStream", href: "/audio-stream" },
      { title: "Camera", href: "/camera" },
      { title: "Circle", href: "/circle" },
      { title: "Color", href: "/color" },
      { title: "EasingAnimation", href: "/easing-animation" },
      { title: "Font", href: "/font" },
      { title: "InputAction", href: "/input-action" },
      { title: "Line", href: "/line" },
      { title: "Mask", href: "/mask" },
      { title: "PixelArray", href: "/pixel-array" },
      { title: "PolarCoordinate", href: "/polar-coordinate" },
      { title: "Polygon", href: "/polygon" },
      { title: "Rect", href: "/rect" },
      { title: "Texture", href: "/texture" },
      { title: "TileMap", href: "/tile_map" },
      { title: "Timer", href: "/timer" },
      { title: "Vec2", href: "/vec2" },
    ],
  },
  {
    title: "Functions",
    href: "/functions",
    noLink: true,
    items: [
      { title: "Color", href: "/color" },
      { title: "Draw", href: "/draw" },
      { title: "Ease", href: "/ease" },
      { title: "Event", href: "/event" },
      { title: "Gamepad", href: "/gamepad" },
      { title: "Input", href: "/input" },
      { title: "Key", href: "/key" },
      { title: "Line", href: "/line" },
      { title: "Math", href: "/math" },
      { title: "Mouse", href: "/mouse" },
      { title: "Rect", href: "/rect" },
      { title: "Renderer", href: "/renderer" },
      { title: "Time", href: "/time" },
      { title: "Transform", href: "/transform" },
      { title: "Window", href: "/window" },
    ],
  },
];

export const GUIDE_ROUTES: EachRoute[] = [
  {
    title: "Using The Renderer",
    href: "/using-the-renderer",
    noLink: true,
    items: [
      { title: "How It Works", href: "/how-it-works" },
      { title: "Drawing Shapes", href: "/drawing-shapes" },
      { title: "Rendering Textures", href: "/rendering-textures" },
    ],
  },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({ title: node.title, href: node.href });
  }
  node.items?.forEach((subNode) => {
    const temp = { ...subNode, href: `${node.href}${subNode.href}` };
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export const docs_routes = DOC_ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
export const guides_routes = GUIDE_ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
