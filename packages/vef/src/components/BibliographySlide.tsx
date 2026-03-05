import { usePresentation } from "./PresentationProvider";
import { Slide } from "./SlideDeck";

const REFS_PER_PAGE = 10;

/**
 * Auto-generated bibliography slide(s). Place as the last child(ren) of <SlideDeck>.
 *
 * Reads all citations registered via <Citation> and renders them as a formatted
 * reference list. Auto-paginates if there are more than REFS_PER_PAGE entries.
 *
 * Usage:
 *   <SlideDeck>
 *     {... slides ...}
 *     <BibliographySlide />
 *   </SlideDeck>
 */
export function BibliographySlide() {
    const { getCitations } = usePresentation();
    const citations = getCitations();

    if (citations.length === 0) return null;

    const useColumns = citations.length > 7;

    return (
        <Slide>
            <h1>References</h1>
            <div style={{ columnCount: useColumns ? 2 : 1, columnGap: '48px', width: '100%' }}>
                <ol className="bibliography-list" style={{ display: 'block' }}>
                    {citations.map((entry, idx) => {
                        const parts: string[] = [];
                        if (entry.author) parts.push(entry.author);
                        if (entry.year) parts.push(`(${entry.year})`);
                        parts.push(`"${entry.title}"`);
                        if (entry.publisher) parts.push(entry.publisher);

                        return (
                            <li key={entry.id} className="bibliography-item" style={{ breakInside: 'avoid', marginBottom: '12px' }}>
                                <span className="bibliography-text">
                                    <span style={{ fontWeight: 600, color: 'var(--accent)', marginRight: '6px' }}>
                                        [{idx + 1}]
                                    </span>
                                    {parts.join(". ")}
                                    {entry.url && (
                                        <>
                                            {". "}
                                            <a
                                                href={entry.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bibliography-url"
                                            >
                                                {entry.url}
                                            </a>
                                        </>
                                    )}
                                    {entry.accessDate && (
                                        <span className="bibliography-access">
                                            {" "}[Accessed {entry.accessDate}]
                                        </span>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </Slide>
    );
}
