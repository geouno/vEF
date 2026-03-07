import { usePresentation } from "./PresentationProvider";

interface SectionProgressProps {
    slideIndex?: number;
    interactive?: boolean;
}

function getSectionIndexForSlide(slideIndex: number, sectionStart: number, sectionEnd: number) {
    return slideIndex >= sectionStart && slideIndex <= sectionEnd;
}

export function SectionProgress({ slideIndex, interactive = true }: SectionProgressProps) {
    const { currentSlide, currentSectionIndex, goToSection, sections } = usePresentation();
    const resolvedSlideIndex = slideIndex ?? currentSlide;
    const resolvedSectionIndex = slideIndex === undefined
        ? currentSectionIndex
        : sections.findIndex((section) => getSectionIndexForSlide(resolvedSlideIndex, section.startSlide, section.endSlide));

    if (sections.length === 0 || resolvedSectionIndex < 0) {
        return null;
    }

    return (
        <nav className="section-progress" aria-label="Presentation sections">
            {sections.map((section, index) => {
                const isActive = index === resolvedSectionIndex;
                const isComplete = resolvedSlideIndex > section.endSlide;

                if (!interactive) {
                    return (
                        <div
                            key={`${section.title}-${section.startSlide}`}
                            className={`section-progress__item${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                            aria-current={isActive ? "step" : undefined}
                        >
                            <span className="section-progress__label">{section.title}</span>
                        </div>
                    );
                }

                return (
                    <button
                        key={`${section.title}-${section.startSlide}`}
                        type="button"
                        className={`section-progress__item${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                        onClick={() => goToSection(index)}
                        aria-current={isActive ? "step" : undefined}
                        title={section.title}
                    >
                        <span className="section-progress__label">{section.title}</span>
                    </button>
                );
            })}
        </nav>
    );
}
