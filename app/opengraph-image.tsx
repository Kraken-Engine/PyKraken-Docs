import { ImageResponse } from "next/og";

/* eslint-disable @next/next/no-img-element */

export const runtime = "edge";
export const alt = "Kraken Engine - 2D Game Engine for Python";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

const BRAND = {
    mint: "#54B69B",
    deep: "#1D353C",
    cream: "#FCE3BA",
    sand: "#D4BF9C",
    night: "#0E1D22",
};

const LOGO_URL = "https://krakenengine.org/images/knicon.svg";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "56px",
                    background:
                        "radial-gradient(circle at 82% -8%, rgba(84, 182, 155, 0.36) 0%, rgba(84, 182, 155, 0) 46%), linear-gradient(140deg, #0E1D22 0%, #1D353C 62%, #2D5158 100%)",
                    color: BRAND.cream,
                    position: "relative",
                    overflow: "hidden",
                    fontFamily:
                        '"Trebuchet MS", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        right: -120,
                        top: -120,
                        width: 380,
                        height: 380,
                        borderRadius: 999,
                        background: "rgba(84, 182, 155, 0.18)",
                        border: "2px solid rgba(84, 182, 155, 0.38)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: -100,
                        bottom: -120,
                        width: 300,
                        height: 300,
                        borderRadius: 999,
                        background: "rgba(212, 191, 156, 0.1)",
                        border: "2px solid rgba(252, 227, 186, 0.25)",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <img
                        src={LOGO_URL}
                        alt=""
                        width={64}
                        height={64}
                        style={{
                            display: "block",
                            borderRadius: 999,
                            // background: "rgba(29, 53, 60, 0.4)",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: 30,
                            letterSpacing: 2.6,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            opacity: 0.95,
                            color: BRAND.mint,
                        }}
                    >
                        Kraken Engine
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div
                        style={{
                            fontSize: 84,
                            fontWeight: 900,
                            lineHeight: 1,
                            maxWidth: 1040,
                            color: BRAND.cream,
                            letterSpacing: -1.2,
                            textWrap: "balance",
                        }}
                    >
                        Build powerful 2D games in Python.
                    </div>
                    <div
                        style={{
                            fontSize: 33,
                            lineHeight: 1.22,
                            opacity: 0.97,
                            maxWidth: 1040,
                            color: BRAND.sand,
                            fontStyle: "italic",
                        }}
                    >
                        Documentation, guides, API reference, and practical examples.
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 28,
                        opacity: 0.98,
                        color: BRAND.cream,
                    }}
                >
                    <div style={{ letterSpacing: 0.8 }}>krakenengine.org</div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                border: `1.5px solid ${BRAND.sand}`,
                                borderRadius: 10,
                                padding: "8px 14px",
                                color: BRAND.deep,
                                background: BRAND.sand,
                                fontWeight: 800,
                                letterSpacing: 0.8,
                                textTransform: "uppercase",
                                fontSize: 21,
                            }}
                        >
                            MIT
                        </div>
                        <div
                            style={{
                                border: `1.5px solid ${BRAND.mint}`,
                                borderRadius: 10,
                                padding: "8px 16px",
                                color: BRAND.mint,
                                background: "rgba(84, 182, 155, 0.1)",
                                fontWeight: 700,
                                letterSpacing: 0.8,
                                textTransform: "uppercase",
                                fontSize: 23,
                            }}
                        >
                            FOSS
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
