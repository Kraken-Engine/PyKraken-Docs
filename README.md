# Kraken Engine documentation

A custom Astro site for the Kraken Engine manual and current Python/C++ API.
The site ships static HTML, self-hosted fonts, and a small script for language
selection, search, code copying, and navigation. No application server is needed.

## Run locally

Use Node.js 24 and pnpm 11.1.1:

    pnpm install --frozen-lockfile
    pnpm dev

Open http://127.0.0.1:4321. To check production output:

    pnpm check
    pnpm api:test
    pnpm build
    pnpm preview

The production build verifies internal links/assets, preserved guide routes,
and every generated API member.

## Content ownership

- `contents/guides/` retains the original 19 MDX files unchanged.
- `contents/docs/manual/` and `contents/docs/preface/` are also retained.
- `examples/cpp.json` and `examples/guides/` contain 62 C++ companions. The build
  pairs these with Python blocks without rewriting guides. Missing companions
  fail the build. C++ examples target 1.8.0; original Python may use older APIs.
- `src/data/api.json` is generated. Do not hand-edit it.
- `src/pages/api/` controls reference presentation independently of extraction.
- Original `contents/docs/classes/` and `contents/docs/functions/` remain as
  migration records. Their old routes redirect into the new API.

The global preference uses the `kraken_language` cookie for one year with
`Path=/; SameSite=Lax`. Python is the initial default. Explicit API URLs select
their own language so shared links are predictable. Switching an entry opens its
unambiguous counterpart or the destination index. Guides switch code panels only.
Shader-language tabs remain local to their code group.

## Regenerate the API

Requires Doxygen, Python 3.11+, and an importable installed `pykraken` module:

    pnpm api:generate

`api.config.json` defaults to `D:/Code/PyKraken`. Override it with:

    python scripts/extract_api.py --source /path/to/PyKraken

Alternatively set `KRAKEN_ENGINE_SOURCE`. `--doxygen` accepts another executable.
Open `kraken-docs.code-workspace` to include both docs and engine in your editor.

Python extraction uses runtime introspection for native signatures, overloads,
properties, public nested types, constants, and enums. C++ uses fresh Doxygen XML
for templates, overloads, public members, and enums. Private/underscore-prefixed
implementation names are excluded. Missing source prose is identified explicitly.

Both sources validate before one atomic replacement of `src/data/api.json`.
The generator never writes guide files. Versions and the engine commit are
recorded. Regenerate and commit the snapshot whenever the engine changes.
Hosting builds use the snapshot and need no engine install or C++ toolchain.
The old `scripts/generate_api_docs.py` command delegates to the new extractor.

## Engine development install

In the engine checkout, after installing its documented prerequisites:

    git switch main
    git pull --ff-only origin main
    python -m pip install --no-build-isolation -ve .

Then regenerate the docs. Site builds never pull the engine or reinstall Python.

## Validation

`pnpm api:test` covers overload extraction, case-insensitive route uniqueness,
public/private filtering, enums, counterparts, API coverage, C++ example coverage,
and qualified C++ symbols against the source snapshot.

`python scripts/prepare-cpp-check.py` creates `.cache/cpp-examples.cpp` with fixtures
for all 62 examples. In a Visual Studio x64 developer prompt:

    cl /nologo /std:c++20 /Zs /EHsc /utf-8 /I"D:/Code/PyKraken/include" /I"D:/Code/PyKraken/vcpkg_installed/x64-windows/include" .cache/cpp-examples.cpp

This checks syntax without opening windows or loading assets. The deliberate
font-lifetime anti-example remains labeled as incorrect and is never executed.
Syntax validation does not replace runtime tests of complete applications.

## Deploy

Deploy `dist/`. Netlify configuration sets `pnpm build` and removes the old Next.js
plugin. Hashed assets receive long-lived cache headers.

For GitHub Pages, enable GitHub Actions as the Pages source and manually run
**Build and deploy documentation**. Supply `/` for a custom domain or
`/repository-name` for project pages, plus the canonical site origin. Pull requests
run checks without deployment.

To reproduce project-path output in PowerShell:

    $env:BASE_PATH='/PyKraken-Docs'
    $env:SITE_URL='https://kraken-engine.github.io'
    pnpm build

Clear these variables before building for a root domain. Cloudflare Workers
static assets or Pages can also serve `dist`; no provider-specific runtime is used.
Compare measured visitor latency before switching hosts.

## Docker

    docker compose up --build

Serves production on http://localhost:3000 using nginx. For development:

    docker compose -f docker-compose.dev.yml up --build

## Design

Warm paper colors, chapter accents, a vector island illustration, the original
Kraken logo, and local Fredoka/Nunito fonts. Layouts use the viewport width while
prose retains readable line lengths. Signatures wrap, sidebars scroll independently,
and mobile navigation collapses. Dark mode, keyboard search (`/` or Ctrl/Cmd+K),
focus states, code copying, and reduced-motion preferences are supported.
