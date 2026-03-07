import React, { useEffect, useMemo } from "react";
import { SectionProgress } from "./SectionProgress";
import { type PresentationSection, usePresentation } from "./PresentationProvider";
import { FloatingControls } from "./FloatingControls";

export interface SlideSectionProps {
    title: string;
    children: React.ReactNode;
}

interface SlideDeckProps {
    children: React.ReactNode;
    showSectionProgress?: boolean;
}

function isSlideSectionElement(
    child: React.ReactNode
): child is React.ReactElement<SlideSectionProps, typeof SlideSection> {
    return React.isValidElement(child) && child.type === SlideSection;
}

function flattenSlides(children: React.ReactNode): {
    slides: React.ReactNode[];
    sections: PresentationSection[];
} {
    const slides: React.ReactNode[] = [];
    const sections: PresentationSection[] = [];

    React.Children.forEach(children, (child) => {
        if (isSlideSectionElement(child)) {
            const sectionSlides = React.Children.toArray(child.props.children);
            if (sectionSlides.length === 0) {
                return;
            }

            const startSlide = slides.length;
            slides.push(...sectionSlides);
            sections.push({
                title: child.props.title,
                startSlide,
                endSlide: startSlide + sectionSlides.length - 1,
            });
            return;
        }

        slides.push(child);
    });

    return { slides, sections };
}

/**
 * SlideDeck manages the overall presentation layout and registers the slides
 * with the PresentationProvider connection.
 */
export function SlideDeck({ children, showSectionProgress = false }: SlideDeckProps) {
    const { currentSlide, setSections, setTotalSlides, printMode } = usePresentation();
    const { slides, sections } = useMemo(() => flattenSlides(children), [children]);

    useEffect(() => {
        setTotalSlides(slides.length);
        setSections(sections);
    }, [sections, setSections, slides.length, setTotalSlides]);

    return (
        <div className={`slide-deck ${printMode ? 'print-mode' : ''}`}>
            {!printMode && <FloatingControls />}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className="slide-wrapper"
                    style={{
                        display: (index === currentSlide || printMode) ? "flex" : "none",
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    {slide}
                    {showSectionProgress && (
                        <SectionProgress slideIndex={index} interactive={!printMode} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function Slide({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`slide-container`}>
            <div className={`slide ${className}`}>
                {children}
            </div>
        </div>
    );
}

export function SlideSection({ children }: SlideSectionProps) {
    return <>{children}</>;
}
