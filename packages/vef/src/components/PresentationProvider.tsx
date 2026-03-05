import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface PresentationContextType {
    currentSlide: number;
    totalSlides: number;
    nextSlide: () => void;
    prevSlide: () => void;
    goToSlide: (index: number) => void;
    setTotalSlides: (total: number) => void;
    printMode: boolean;
    setPrintMode: (mode: boolean) => void;
    printToPDF: () => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export function usePresentation() {
    const context = useContext(PresentationContext);
    if (!context) {
        throw new Error("usePresentation must be used within a PresentationProvider");
    }
    return context;
}

export function PresentationProvider({ children }: { children: ReactNode }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [totalSlides, setTotalSlides] = useState(0);
    const [printMode, setPrintMode] = useState(false);

    const nextSlide = () => {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    const goToSlide = (index: number) => {
        if (index >= 0 && index < totalSlides) {
            setCurrentSlide(index);
        }
    };

    const printToPDF = () => {
        setPrintMode(true);
        // Wait for the next tick for React to render all slides (removing the deck overflow clip)
        setTimeout(() => {
            window.print();
            setPrintMode(false);
        }, 100);
    };

    // Keyboard navigation attached to context level
    useEffect(() => {
        // Only if we aren't printing
        if (printMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                nextSlide();
            } else if (e.key === "ArrowLeft") {
                prevSlide();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide, printMode]);

    return (
        <PresentationContext.Provider
            value={{
                currentSlide,
                totalSlides,
                nextSlide,
                prevSlide,
                goToSlide,
                setTotalSlides,
                printMode,
                setPrintMode,
                printToPDF,
            }}
        >
            {children}
        </PresentationContext.Provider>
    );
}
