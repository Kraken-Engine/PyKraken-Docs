import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Metal_Mania, Michroma } from "next/font/google";

import { ArrowUpRightIcon, MedalIcon, SparklesIcon } from "lucide-react";
import styles from "./page.module.css";

const winnerTitleFont = Metal_Mania({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
});

const jamHeadingFont = Michroma({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Showcase",
    description: "Highlights from the Kraken Engine community.",
    alternates: {
        canonical: "/showcase",
    },
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
        actionLabel: "Transmute",
        image: "/images/showcase/alchemy.webp",
    },
    {
        title: "Ascended",
        description:
            "A glowing obelisk awakens myth itself inside the library walls, turning stories into living spirits and prophecy into war. Bookkeepers around the world have already fallen trying to master them. You are a child Bookkeeper inheriting what remains, forced into a final clash where only one spirit, and one wielder, can ascend beyond every known legend.",
        tags: ["Turn-based", "RPG"],
        url: "https://un1bear.itch.io/ascended",
        accent: "from-emerald-500 via-cyan-700 to-indigo-900",
        place: "1st Place",
        actionLabel: "Duel",
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
        actionLabel: "Conquer",
        image: "/images/showcase/pantheons.webp",
    },
];

const curatedProjects = [
    {
        title: "On The Flip Side",
        description:
            "Flip between parallel realities to reshape your surroundings and solve the impossible.",
        tags: ["Platformer", "Puzzle"],
        url: "https://thysillies.itch.io/on-the-flip-side",
        image: "/images/showcase/flip.webp",
    },
    {
        title: "Red Maiden",
        description:
            "Navigate a maze of doors, uncovering the correct path while evading a relentless spirit that lurks within the crimson halls.",
        tags: ["Horror", "Action"],
        url: "https://prince-mario.itch.io/red-maiden",
        image: "/images/showcase/maiden.webp",
    },
    {
        title: "A Calder Case",
        description:
            "Unravel a murder shrouded in lies and jealousy. One wrong move, and the truth may slip away forever.",
        tags: ["ARG", "Noir"],
        url: "https://durkisneer.itch.io/a-calder-case",
        image: "/images/showcase/calder.webp",
    },
    {
        title: "Sumbit",
        description:
            "Race to restore color to a lifeless city, using a short time-rewind ability to undo mistakes and retrace your steps in a burst of rainbow light.",
        tags: ["Sci-Fi"],
        url: "https://aceofjesters.itch.io/noirgameproject",
        image: "/images/showcase/sumbit.webp",
    },
    {
        title: "Brainrot Cookie Clicker",
        description:
            "Meltmaxx to this surreal cookie-clicker experience.",
        tags: ["Platformer", "Retro"],
        url: "https://kibbuz.itch.io/brainrot-noire-cookie-clicker",
        image: "/images/showcase/brainrot.webp",
    },
];

const podiumEntries = [
    { project: jamWinners[1], slot: "first" },
    { project: jamWinners[0], slot: "second" },
    { project: jamWinners[2], slot: "third" },
] as const;

type ConfettiShape = "circle" | "triangle" | "diamond" | "pentagon";

const confettiPieces: Array<{
    id: string;
    shape: ConfettiShape;
    size: number;
    rotate: number;
    opacity: number;
    style: CSSProperties;
}> = [
        { id: "a", shape: "circle", size: 22, rotate: 0, opacity: 0.32, style: { left: "2%", top: "110px" } },
        { id: "b", shape: "diamond", size: 22, rotate: 8, opacity: 0.2, style: { left: "7%", top: "240px" } },
        { id: "c", shape: "triangle", size: 22, rotate: -6, opacity: 0.38, style: { left: "4%", bottom: "290px" } },
        { id: "d", shape: "pentagon", size: 22, rotate: 0, opacity: 0.22, style: { left: "9%", bottom: "125px" } },
        { id: "e", shape: "circle", size: 22, rotate: 0, opacity: 0.33, style: { right: "3%", top: "105px" } },
        { id: "f", shape: "triangle", size: 22, rotate: 7, opacity: 0.19, style: { right: "7%", top: "232px" } },
        { id: "g", shape: "diamond", size: 22, rotate: -10, opacity: 0.34, style: { right: "4%", bottom: "275px" } },
        { id: "h", shape: "pentagon", size: 22, rotate: 0, opacity: 0.26, style: { right: "8%", bottom: "130px" } },
        { id: "i", shape: "circle", size: 16, rotate: 0, opacity: 0.24, style: { left: "18%", top: "70px" } },
        { id: "j", shape: "circle", size: 16, rotate: 0, opacity: 0.36, style: { right: "18%", top: "80px" } },
        { id: "k", shape: "diamond", size: 16, rotate: 16, opacity: 0.21, style: { left: "16%", bottom: "80px" } },
        { id: "l", shape: "triangle", size: 16, rotate: -12, opacity: 0.28, style: { right: "16%", bottom: "82px" } },
        { id: "m", shape: "circle", size: 14, rotate: 0, opacity: 0.16, style: { left: "11%", top: "165px" } },
        { id: "n", shape: "triangle", size: 14, rotate: 14, opacity: 0.3, style: { left: "13%", top: "320px" } },
        { id: "o", shape: "pentagon", size: 14, rotate: -10, opacity: 0.17, style: { left: "14%", bottom: "210px" } },
        { id: "p", shape: "diamond", size: 14, rotate: 0, opacity: 0.27, style: { right: "12%", top: "160px" } },
        { id: "q", shape: "circle", size: 14, rotate: 0, opacity: 0.18, style: { right: "13%", top: "320px" } },
        { id: "r", shape: "triangle", size: 14, rotate: -14, opacity: 0.31, style: { right: "14%", bottom: "206px" } },
        { id: "s", shape: "diamond", size: 18, rotate: -6, opacity: 0.15, style: { left: "22%", top: "120px" } },
        { id: "t", shape: "pentagon", size: 18, rotate: 7, opacity: 0.26, style: { right: "22%", top: "125px" } },
    ];

function ConfettiGlyph({ shape }: { shape: ConfettiShape }) {
    if (shape === "circle") {
        return <circle cx="12" cy="12" r="7" className={styles.confettiStroke} />;
    }

    if (shape === "triangle") {
        return <polygon points="12,5 5,19 19,19" className={styles.confettiStroke} />;
    }

    if (shape === "diamond") {
        return <polygon points="12,4 20,12 12,20 4,12" className={styles.confettiStroke} />;
    }

    return <polygon points="12,4 20,10 17,20 7,20 4,10" className={styles.confettiStroke} />;
}

export default function ShowcasePage() {
    return (
        <main className="relative mx-auto w-full max-w-[92rem] px-5 pb-16 pt-10 sm:px-8 lg:px-12">
            <div className={styles.backgroundCanvas} aria-hidden>
                {confettiPieces.map((piece) => (
                    <svg
                        key={piece.id}
                        className={styles.confettiPiece}
                        viewBox="0 0 24 24"
                        style={{
                            ...piece.style,
                            width: `${piece.size}px`,
                            height: `${piece.size}px`,
                            opacity: piece.opacity,
                            transform: `rotate(${piece.rotate}deg)`,
                        }}
                    >
                        <ConfettiGlyph shape={piece.shape} />
                    </svg>
                ))}
            </div>

            <div className="relative z-10 flex flex-col gap-12">
                <section className={styles.heroBanner}>
                    <p className="font-code text-center text-xs uppercase tracking-[0.25em] text-slate-700 dark:text-cyan-200/75">Kraken Engine</p>
                    <h1 className="mt-2 text-center text-3xl font-semibold leading-tight text-slate-950 dark:text-white sm:text-4xl">Community Showcase</h1>
                    <p className="mx-auto mt-2 max-w-3xl text-center text-sm text-slate-700 dark:text-slate-200/85 sm:text-base">
                        Projects made with Kraken Engine. Some push the limits of what the engine can do, others are just cool games people have built.
                    </p>
                </section>

                <section id="jam-winners" className="space-y-5">
                    <div className="flex items-center justify-center">
                        <h2 className={`${jamHeadingFont.className} ${styles.jamHeading}`}>Jam Winners</h2>
                    </div>

                    <div className={styles.podiumGrid}>
                        {podiumEntries.map(({ project, slot }) => (
                            <article
                                key={project.title}
                                className={`${styles.podiumCard} ${slot === "first" ? styles.podiumFirst : ""} ${slot === "second" ? styles.podiumSecond : ""} ${slot === "third" ? styles.podiumThird : ""
                                    }`}
                            >
                                <div className={styles.zineDecor} aria-hidden>
                                    <span className={styles.halftonePatch} />
                                    {slot === "first" ? <span className={styles.featureSticker}>spotlight</span> : null}
                                </div>

                                <div className={styles.mediaShell}>
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className={styles.mediaImage}
                                    />
                                    <div className={styles.mediaVignette} />

                                    <span className={styles.placeBadge}>{project.place}</span>
                                </div>

                                <div className={styles.cardContent}>
                                    <header className={styles.winnerHeader}>
                                        <h3
                                            className={`${slot === "first"
                                                ? `${winnerTitleFont.className} ${styles.firstTitle}`
                                                : "text-xl font-semibold tracking-tight"
                                                }`}
                                        >
                                            {project.title}
                                        </h3>

                                        <ul className={`${styles.winnerTagList} ${slot === "first" ? styles.winnerTagsCentered : ""}`}>
                                            {project.tags.map((tag) => (
                                                <li
                                                    key={tag}
                                                    className={styles.winnerTag}
                                                >
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>

                                        {slot === "first" ? (
                                            <div className={styles.firstDescriptionWrap}>
                                                <p className={styles.firstDescriptionLeft}>
                                                    A mysterious obelisk lit the stacks and woke every tale in the library. Myths stepped off their pages as living spirits, and ancient markings promised a war between powers so vast the winner would rise beyond what fiction itself had room to name.
                                                </p>
                                                <p className={styles.firstDescriptionRight}>
                                                    Bookkeepers crossed continents, bound spirits, and disappeared one by one. You inherit the remnants: a child Bookkeeper moving through haunted maps, surviving turn-based encounters, and carving a path through impossible creatures. This is not a blessing, it is a trial of will, and only one soul will be ascended beyond the limits of recorded knowledge.
                                                </p>
                                            </div>
                                        ) : (
                                            <p className={styles.winnerDescription}>{project.description}</p>
                                        )}
                                    </header>

                                    <Link
                                        href={project.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`${styles.primaryButton} mt-auto`}
                                    >
                                        {project.actionLabel}
                                        <ArrowUpRightIcon className="h-4 w-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="favorite-picks" className="space-y-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
                            <SparklesIcon className="h-6 w-6 text-primary" />
                            Favorite Picks
                        </h2>
                        <p className="text-sm text-muted-foreground">Curated projects worth your immediate attention.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {curatedProjects.map((project) => (
                            <article
                                key={project.title}
                                className={styles.favoriteCard}
                            >
                                <div className={styles.favoriteMediaShell}>
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className={styles.favoriteMediaImage}
                                    />
                                    <div className={styles.mediaVignette} />
                                </div>

                                <div className="flex flex-1 flex-col gap-4 p-5">
                                    <header className={styles.favoriteHeader}>
                                        <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
                                        <ul className={styles.favoriteTagList}>
                                            {project.tags.map((tag) => (
                                                <li
                                                    key={tag}
                                                    className={styles.favoriteTag}
                                                >
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>
                                    </header>
                                    <p className={styles.favoriteDescription}>{project.description}</p>

                                    <Link
                                        href={project.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`${styles.secondaryButton} mt-auto`}
                                    >
                                        Open Game
                                        <ArrowUpRightIcon className="h-4 w-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.communityStrip}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
                            <MedalIcon className="h-5 w-5 text-primary" />
                            Ship something bold. We might feature it next.
                        </h3>
                        <Link
                            href="https://github.com/Kraken-Engine/PyKraken"
                            target="_blank"
                            rel="noreferrer"
                            className={styles.secondaryButton}
                        >
                            Join the Community
                            <ArrowUpRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
