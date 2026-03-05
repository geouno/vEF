import React, { useEffect } from "react";
import { usePresentation } from "./PresentationProvider";
import { FloatingControls } from "./FloatingControls";

interface SlideDeckProps {
    children: React.ReactNode;
}

/**
 * SlideDeck manages the overall presentation layout and registers the slides
 * with the PresentationProvider connection.
 */
export function SlideDeck({ children }: SlideDeckProps) {
    const { currentSlide, setTotalSlides, printMode } = usePresentation();
    const slides = React.Children.toArray(children);

    useEffect(() => {
        setTotalSlides(slides.length);
    }, [slides.length, setTotalSlides]);

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
                        justifyContent: "center"
                    }}
                >
                    {slide}
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
