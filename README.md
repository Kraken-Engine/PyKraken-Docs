# PyKraken Documentation

Official documentation website for **Kraken Engine** (PyKraken) - a Python game development framework.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pykraken-docs

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

The site will be available at `http://localhost:3000`

### Building

```bash
# Create a production build
pnpm build

# Preview the production build
pnpm start
```

## Documentation Structure

- **`/contents/docs`** - API reference documentation
  - `/classes` - Engine class documentation (Camera, Sprite, Audio, etc.)
  - `/functions` - Utility functions (collision, drawing, math, etc.)
  - `/manual` - User manual and guides
  - `/preface` - Getting started information
- **`/contents/guides`** - Tutorial guides and how-tos
- **`/app`** - Next.js app router pages
- **`/components`** - React components for the documentation site
- **`/scripts`** - Python scripts for generating API docs from source

## Scripts

- **`generate_api_docs.py`** - Generates API documentation from PyKraken source code
- **`sync_changelog.py`** - Syncs changelog from the main engine repository

## Contributing

Contributions to improve the documentation are welcome! Please ensure:

- Documentation is clear and accurate
- Code examples are tested and functional
- Markdown formatting follows the existing style
- Links and references are valid

For detailed information on building the documentation locally, visit: https://krakenengine.org/docs/preface/building

## License

This documentation is licensed under the same license as the Kraken Engine project. See [LICENSE](LICENSE) for details.
