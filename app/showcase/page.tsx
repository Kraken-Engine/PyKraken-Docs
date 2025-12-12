import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { TrophyIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Showcase",
    description: "Highlights from the Kraken Engine community.",
};

const jamWinners = [
    {
        title: "Mythic Alchemy",
        description:
            "Fuse mythical cards, read the runes, and outsmart your opponent in this Norse-inspired card battler.",
        tags: ["Strategy", "Card Game"],
        url: "https://durkisneer.itch.io/mythic-alchemy",
        accent: "from-amber-700 via-slate-700 to-indigo-900",
        place: "2nd Place",
        image: "/images/showcase/alchemy.webp",
    },
    {
        title: "Ascended",
        description:
            "Bind awakened myths as a fledgling Bookkeeper and battle for the one spirit destined to ascend beyond legend.",
        tags: ["Turn-based", "RPG"],
        url: "https://un1bear.itch.io/ascended",
        accent: "from-emerald-500 via-cyan-700 to-indigo-900",
        place: "1st Place",
        image: "/images/showcase/ascended.webp",
    },
    {
        title: "Clash of Pantheons",
        description:
            "Slide mythic tiles onto the board, flank rivals, and trade edges in a tactical duel of battling pantheons.",
        tags: ["Strategy", "Board Game"],
        url: "https://kitzun3.itch.io/clash-of-pantheons",
        accent: "from-yellow-800 via-amber-900 to-slate-800",
        place: "3rd Place",
        image: "/images/showcase/pantheons.webp",
    },
];

const curatedProjects = [
    {
        title: "Red Maiden",
        description:
            "Navigate a maze of doors, uncovering the correct path while evading a relentless spirit that lurks within the crimson halls.",
        tags: ["Horror", "Action"],
        url: "https://prince-mario.itch.io/red-maiden",
        image: "/images/showcase/maiden.webp", // Add your image path here
    },
    {
        title: "A Calder Case",
        description:
            "Unravel a murder shrouded in lies and jealousy. One wrong move, and the truth may slip away forever.",
        tags: ["ARG", "Noir"],
        url: "https://durkisneer.itch.io/a-calder-case",
        image: "/images/showcase/calder.webp", // Add your image path here
    },
    {
        title: "Sumbit",
        description:
            "Race to restore color to a lifeless city, using a short time-rewind ability to undo mistakes and retrace your steps in a burst of rainbow light.",
        tags: ["Sci-Fi"],
        url: "https://aceofjesters.itch.io/noirgameproject",
        image: "/images/showcase/sumbit.webp", // Add your image path here
    },
    {
        title: "Brainrot Cookie Clicker",
        description:
            "Meltmaxx to this surreal cookie-clicker experience.",
        tags: ["Platformer", "Retro"],
        url: "https://kibbuz.itch.io/brainrot-noire-cookie-clicker",
        image: "/images/showcase/brainrot.webp", // Add your image path here
    },
];

export default function ShowcasePage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-14 sm:px-10">
            <section className="space-y-5 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Kraken Engine</p>
                <h1 className="text-4xl font-semibold sm:text-5xl">Community Showcase</h1>
                <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
                    Projects made with Kraken Engine. Some push the limits of what the engine can do, others are just cool games people have built.
                </p>
            </section>

            {/* Jam Winners Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-center gap-3">
                    <TrophyIcon className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold sm:text-3xl">Last Jam Winners</h2>
                    <TrophyIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="grid gap-6 md:grid-cols-3 md:items-end">
                    {jamWinners.map((project, index) => (
                        <article
                            key={project.title}
                            className={`group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] ${index === 1 ? 'md:scale-105' : ''
                                }`}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                boxShadow: index === 1
                                    ? '0 12px 48px 0 rgba(0, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
                                    : '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                                backfaceVisibility: 'hidden',
                                WebkitFontSmoothing: 'subpixel-antialiased',
                                transform: 'translateZ(0)',
                            }}
                        >
                            {/* Gradient border effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{ padding: '1px' }}>
                            </div>

                            {/* Glowing accent border - stronger for 1st place */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${project.accent} ${index === 1 ? 'opacity-30 blur-2xl' : 'opacity-20 blur-xl'
                                } transition-opacity duration-300 group-hover:opacity-40`}></div>

                            <div className="relative z-10">
                                <div className={`relative ${index === 1 ? 'h-56' : 'h-48'} w-full overflow-hidden`}>
                                    {/* Image or gradient background */}
                                    {project.image ? (
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            className="object-cover transition-all duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${project.accent} opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100`}
                                        />
                                    )}
                                    {/* Subtle dark gradient overlay (no color tinting) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent"></div>

                                    {/* Place badge */}
                                    <div className={`absolute right-4 top-4 rounded-full backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg ${index === 1 ? 'text-sm' : ''
                                        }`}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        }}>
                                        {project.place}
                                    </div>
                                </div>

                                {/* Colored card body for winners */}
                                <div
                                    className={`flex flex-1 flex-col gap-4 p-6 ${index === 1 ? 'pb-8' : ''}`}
                                    style={{
                                        background: `linear-gradient(to bottom, transparent, rgba(var(--card-rgb, 0, 0, 0), 0.6))`,
                                    }}
                                >
                                    <header className="space-y-2">
                                        <h3 className={`${index === 1 ? 'text-2xl' : 'text-xl'} font-semibold tracking-tight`}>{project.title}</h3>
                                        <p className="text-sm text-muted-foreground/90">{project.description}</p>
                                    </header>

                                    <ul className="flex flex-wrap gap-2 text-xs font-medium">
                                        {project.tags.map((tag) => (
                                            <li key={tag}
                                                className="rounded-full px-3 py-1 uppercase tracking-wide transition-colors"
                                                style={{
                                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                                }}>
                                                {tag}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto pt-2">
                                        <Link
                                            href={project.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`winner-button flex ${index === 1 ? 'h-12' : 'h-11'} w-full items-center justify-center rounded-xl text-sm font-semibold`}
                                        >
                                            View Project
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Curated Projects Section */}
            <section className="space-y-8">
                <h2 className="text-center text-2xl font-semibold sm:text-3xl">Curated Favorites</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
                    {curatedProjects.map((project) => (
                        <article
                            key={project.title}
                            className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-400 hover:translate-y-[-3px] hover:shadow-lg"
                            style={{
                                // background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.9))',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(59, 130, 246, 0.1)',
                            }}
                        >
                            {/* Gradient border effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{ padding: '1px' }}>
                            </div>

                            {/* Subtle blue glow */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 blur-xl transition-opacity duration-300 group-hover:opacity-20"></div>

                            <div className="relative z-10">
                                <div className="relative h-44 w-full overflow-hidden">
                                    {/* Image or gradient background */}
                                    {project.image ? (
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${project.accent} opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100`}
                                        />
                                    )}
                                    {/* Glass overlay on image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                                </div>

                                {/* Dark blue uniform body */}
                                <div
                                    className="flex flex-1 flex-col gap-4 p-6"
                                    style={{
                                        background: 'hsl(220, 14%, 12%)',
                                    }}
                                >
                                    <header className="space-y-2">
                                        <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
                                        <p className="text-sm text-muted-foreground/90">{project.description}</p>
                                    </header>

                                    <ul className="flex flex-wrap gap-2 text-xs font-medium">
                                        {project.tags.map((tag) => (
                                            <li key={tag}
                                                className="rounded-full px-3 py-1 uppercase tracking-wide transition-colors"
                                                style={{
                                                    border: '1px solid hsl(220, 14%, 25%)',
                                                }}>
                                                {tag}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto pt-2">
                                        <Link
                                            href={project.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:border-blue-400"
                                            style={{
                                                background: 'hsl(220, 14%, 16%)',
                                                border: '1px solid hsl(220, 14%, 25%)',
                                                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
                                            }}
                                        >
                                            View Project
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
