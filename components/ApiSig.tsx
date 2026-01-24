import React from 'react';
import { TYPE_LINKS } from '@/lib/type-links';

type Param = {
    name: string;
    type?: string;
    default?: string;      // shows = value
};

type ApiSigProps = {
    name: string;          // function name
    params?: Param[];
    returns?: string;      // return type
    className?: string;    // extra classes
};

const S = {
    t: (s: string) => <span>{s}</span>,                           // text (wrapped to avoid MDX raw text)
    sp: () => <span className="space">{' '}</span>,
    p: (s: string) => <span className="punct">{s}</span>,          // punctuation
    arrow: () => <span className="arrow">{"\u2192"}</span>,
};

const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const typeLinkKeys = Object.keys(TYPE_LINKS);
const typeLinkRegex = typeLinkKeys.length
    ? new RegExp(`\\b(${typeLinkKeys.map(escapeRegExp).join('|')})\\b`, 'g')
    : null;

const renderType = (value?: string) => {
    if (!value) return null;
    if (!typeLinkRegex) return <span className="type">{value}</span>;

    const parts = value.split(typeLinkRegex);
    return (
        <span className="type">
            {parts.map((part, index) => {
                const href = TYPE_LINKS[part as keyof typeof TYPE_LINKS];
                if (href) {
                    return (
                        <a key={`${part}-${index}`} href={href}>
                            {part}
                        </a>
                    );
                }
                return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
            })}
        </span>
    );
};

export default function ApiSig({
    name,
    params = [],
    returns,
    className = "",
    multiline = false,
    indent = 4,
}: ApiSigProps & { multiline?: boolean; indent?: number }) {
    const indentSpaces = "&nbsp;".repeat(indent);

    if (multiline) {
        return (
            <div className={`api-sig api-sig--block ${className}`}>
                <code>
                    <span className="keyword">{name}</span>
                    {S.p("(")}
                    <br />
                    {params.map((p, i) => (
                        <React.Fragment key={i}>
                            <span dangerouslySetInnerHTML={{ __html: indentSpaces }} />
                            <span className="param">
                                <span className="param-name">{p.name}</span>
                                {p.type && (
                                    <>
                                        <span className="punct">:</span>
                                        {S.sp()}
                                        {renderType(p.type)}
                                    </>
                                )}
                                {p.default && (
                                    <>
                                        {S.sp()}
                                        <span className="punct">=</span>
                                        {S.sp()}
                                        <span className="literal">{p.default}</span>
                                    </>
                                )}
                            </span>
                            {i < params.length - 1 && <span className="punct">,</span>}
                            <br />
                        </React.Fragment>
                    ))}
                    {S.p(")")}
                    {returns && (
                        <>
                            {S.sp()}<S.arrow />{S.sp()}
                            {renderType(returns)}
                        </>
                    )}
                </code>
            </div>
        );
    }

    // --- SINGLE LINE ---
    return (
        <code className={`api-sig ${className}`}>
            <span className="keyword">{name}</span>
            {S.p("(")}
            {params.map((p, i) => (
                <React.Fragment key={i}>
                    <span className="param">
                        <span className="param-name">{p.name}</span>
                        {p.type && (
                            <>
                                <span className="punct">:</span>
                                {S.sp()}
                                {renderType(p.type)}
                            </>
                        )}
                        {p.default && (
                            <>
                                {S.sp()}
                                <span className="punct">=</span>
                                {S.sp()}
                                <span className="literal">{p.default}</span>
                            </>
                        )}
                    </span>
                    {i < params.length - 1 && <span className="punct">,</span>}
                    {i < params.length - 1 && S.sp()}
                </React.Fragment>
            ))}
            {S.p(")")}
            {returns && (
                <>
                    {S.sp()}<S.arrow />{S.sp()}
                    {renderType(returns)}
                </>
            )}
        </code>
    );
}
