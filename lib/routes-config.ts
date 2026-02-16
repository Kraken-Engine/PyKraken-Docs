// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true; // noLink will create a route segment (section) but cannot be navigated
  items?: EachRoute[];
  tag?: string;
  separator?: true; // adds a separator after this item
};

export const DOC_ROUTES: EachRoute[] = [
  {
    title: "Preface",
    href: "/preface",
    noLink: true,
    items: [
      { title: "Navigating the Docs", href: "" },
      { title: "Building Docs", href: "/building" }
    ]
  },
  {
    title: "Manual",
    href: "/manual",
    noLink: true,
    items: [
      { title: "Keycode vs. Scancode", href: "/keycode-vs-scancode" },
      { title: "Constants", href: "/constants" },
      { title: "Formats and Codecs", href: "/formats-and-codecs" },
      { title: "Event Attributes", href: "/event-attributes" },
      { title: "Framework Comparison", href: "/comparison" },
      { title: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Classes",
    href: "/classes",
    noLink: true,
    items: [
      { title: "Overview", href: "", separator: true },
      { title: "Anchor", href: "/anchor" },
      { title: "AnimationController", href: "/animation-controller" },
      { title: "Audio", href: "/audio" },
      { title: "Body", href: "/body" },
      { title: "Camera", href: "/camera" },
      { title: "Capsule", href: "/capsule" },
      { title: "CastHit", href: "/cast-hit" },
      { title: "CharacterBody", href: "/character-body" },
      { title: "Circle", href: "/circle" },
      { title: "Collision", href: "/collision" },
      { title: "Color", href: "/color" },
      { title: "DistanceJoint", href: "/distance-joint" },
      { title: "EasingAnimation", href: "/easing-animation" },
      { title: "Effect", href: "/effect" },
      { title: "Event", href: "/event" },
      { title: "FilterJoint", href: "/filter-joint" },
      { title: "Flip (Texture)", href: "/texture.-flip" },
      { title: "Font", href: "/font" },
      { title: "ImageLayer", href: "/image-layer" },
      { title: "InputAction", href: "/input-action" },
      { title: "Joint", href: "/joint" },
      { title: "Layer", href: "/layer" },
      { title: "Line", href: "/line" },
      { title: "Map", href: "/map" },
      { title: "MapObject", href: "/map-object" },
      { title: "Mask", href: "/mask" },
      { title: "MotorJoint", href: "/motor-joint" },
      { title: "MouseJoint", href: "/mouse-joint" },
      { title: "ObjectGroup", href: "/object-group" },
      { title: "Orchestrator", href: "/orchestrator" },
      { title: "PixelArray", href: "/pixel-array" },
      { title: "PolarCoordinate", href: "/polar-coordinate" },
      { title: "Polygon", href: "/polygon" },
      { title: "PrismaticJoint", href: "/prismatic-joint" },
      { title: "Rect", href: "/rect" },
      { title: "RevoluteJoint", href: "/revolute-joint" },
      { title: "RigidBody", href: "/rigid-body" },
      { title: "Sample", href: "/sample" },
      { title: "ShaderState", href: "/shader-state" },
      { title: "ShaderUniform", href: "/shader-uniform" },
      { title: "SheetStrip", href: "/sheet-strip" },
      { title: "StaticBody", href: "/static-body" },
      { title: "Stream", href: "/stream" },
      { title: "Terrain (TileSet)", href: "/tile-set.-terrain" },
      { title: "TerrainIndices (TileSet)", href: "/tile-set.-tile.-terrain-indices" },
      { title: "Text", href: "/text" },
      { title: "TextProperties", href: "/text-properties" },
      { title: "Texture", href: "/texture" },
      { title: "Tile (TileLayer)", href: "/tile-layer.-tile" },
      { title: "Tile (TileSet)", href: "/tile-set.-tile" },
      { title: "TileLayer", href: "/tile-layer" },
      { title: "TileResult (TileLayer)", href: "/tile-layer.-tile-result" },
      { title: "TileSet", href: "/tile-set" },
      { title: "Timer", href: "/timer" },
      { title: "Transform", href: "/transform" },
      { title: "Vec2", href: "/vec2" },
      { title: "Vertex", href: "/vertex" },
      { title: "WeldJoint", href: "/weld-joint" },
      { title: "WheelJoint", href: "/wheel-joint" },
      { title: "World", href: "/world" },
    ],
  },
  {
    title: "Functions",
    href: "/functions",
    noLink: true,
    items: [
      { title: "Overview", href: "", separator: true },
      { title: "Collision", href: "/collision" },
      { title: "Color", href: "/color" },
      { title: "Draw", href: "/draw" },
      { title: "Ease", href: "/ease" },
      { title: "Event", href: "/event" },
      { title: "Fx", href: "/fx" },
      { title: "Gamepad", href: "/gamepad" },
      { title: "Input", href: "/input" },
      { title: "Key", href: "/key" },
      { title: "Line", href: "/line" },
      { title: "Log", href: "/log" },
      { title: "Math", href: "/math" },
      { title: "Mixer", href: "/mixer" },
      { title: "Mouse", href: "/mouse" },
      { title: "Physics", href: "/physics" },
      { title: "Pixel Array", href: "/pixel-array" },
      { title: "Rect", href: "/rect" },
      { title: "Renderer", href: "/renderer" },
      { title: "Time", href: "/time" },
      { title: "Transform", href: "/transform" },
      { title: "Viewport", href: "/viewport" },
      { title: "Window", href: "/window" },
    ],
  },
];

export const GUIDE_ROUTES: EachRoute[] = [
  {
    title: "Getting Started",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "Installation", href: "/installation" },
      { title: "Creating a Window", href: "/create-window" },
    ],
  },
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
  {
    title: "Implementing Shaders",
    href: "/implementing-shaders",
    noLink: true,
    items: [
      { title: "What is a Shader?", href: "/what-is-a-shader" },
      { title: "Using Shader States", href: "/using-shader-states" },
      { title: "Uniforms", href: "/uniforms" },
    ]
  },
  {
    title: "Game Essentials",
    href: "/game-essentials",
    noLink: true,
    items: [
      { title: "Vectors for Game Physics", href: "/vector-physics" },
      { title: "Fonts and Text", href: "/fonts-and-text" },
      { title: "Using the Orchestrator", href: "/using-orchestrator" },
    ]
  }
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
