import { useEffect, useState } from "react";
import { usePresentation, type CitationEntry } from "./PresentationProvider";

type CitationProps = Omit<CitationEntry, "id"> & {
    /** Unique citation key, e.g. "oecd2024" */
    id: string;
};

/**
 * Inline citation reference. Renders as a clickable superscript [n].
 *
 * Usage:
 *   <Citation id="oecd2024" title="Work-Life Balance Index" author="OECD" year={2024} url="https://..." />
 *
 * Renders: [1] (superscript, colored with --accent, clickable if url provided)
 */
export function Citation({ id, title, author, year, url, publisher, accessDate }: CitationProps) {
    const { registerCitation } = usePresentation();
    const [num, setNum] = useState<number | undefined>(undefined);

    useEffect(() => {
        const n = registerCitation({ id, title, author, year, url, publisher, accessDate });
        setNum(n);
    }, [id, title, author, year, url, publisher, accessDate, registerCitation]);

    if (num === undefined) return null;

    const label = `[${num}]`;
    const tooltip = [
        author,
        year ? `(${year})` : undefined,
        `"${title}"`,
        publisher,
    ]
        .filter(Boolean)
        .join(" ");

    if (url) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="citation-ref"
                title={tooltip}
            >
                {label}
            </a>
        );
    }

    return (
        <span className="citation-ref" title={tooltip}>
            {label}
        </span>
    );
}
