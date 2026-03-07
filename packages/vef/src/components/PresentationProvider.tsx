import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from "react";

export interface CitationEntry {
    id: string;
    title: string;
    author?: string;
    year?: number;
    url?: string;
    publisher?: string;
    accessDate?: string;
}

export interface PresentationSection {
    title: string;
    startSlide: number;
    endSlide: number;
}

export interface PresentationContextType {
    currentSlide: number;
    totalSlides: number;
    sections: PresentationSection[];
    currentSectionIndex: number;
    currentSection?: PresentationSection;
    nextSlide: () => void;
    prevSlide: () => void;
    goToSlide: (index: number) => void;
    goToSection: (index: number) => void;
    setTotalSlides: (total: number) => void;
    setSections: (sections: PresentationSection[]) => void;
    printMode: boolean;
    setPrintMode: (mode: boolean) => void;
    printToPDF: () => void;
    // Citation system
    registerCitation: (entry: CitationEntry) => number;
    getCitations: () => CitationEntry[];
    getCitationNumber: (id: string) => number | undefined;
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
    const [sections, setSections] = useState<PresentationSection[]>([]);
    const [printMode, setPrintMode] = useState(false);

    // Citation registry — Map preserves insertion order
    const citationsRef = useRef<Map<string, CitationEntry>>(new Map());
    const [, forceUpdate] = useState(0);

    const registerCitation = useCallback((entry: CitationEntry): number => {
        const map = citationsRef.current;
        if (!map.has(entry.id)) {
            map.set(entry.id, entry);
            forceUpdate((n) => n + 1); // trigger re-render for BibliographySlide
        }
        // Return 1-based citation number
        return Array.from(map.keys()).indexOf(entry.id) + 1;
    }, []);

    const getCitations = useCallback((): CitationEntry[] => {
        return Array.from(citationsRef.current.values());
    }, []);

    const getCitationNumber = useCallback((id: string): number | undefined => {
        const keys = Array.from(citationsRef.current.keys());
        const idx = keys.indexOf(id);
        return idx >= 0 ? idx + 1 : undefined;
    }, []);

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

    const goToSection = useCallback((index: number) => {
        const section = sections[index];
        if (section) {
            setCurrentSlide(Math.min(section.startSlide, Math.max(totalSlides - 1, 0)));
        }
    }, [sections, totalSlides]);

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

    const currentSectionIndex = sections.findIndex(
        (section) => currentSlide >= section.startSlide && currentSlide <= section.endSlide
    );
    const currentSection = currentSectionIndex >= 0 ? sections[currentSectionIndex] : undefined;

    return (
        <PresentationContext.Provider
            value={{
                currentSlide,
                totalSlides,
                sections,
                currentSectionIndex,
                currentSection,
                nextSlide,
                prevSlide,
                goToSlide,
                goToSection,
                setTotalSlides,
                setSections,
                printMode,
                setPrintMode,
                printToPDF,
                registerCitation,
                getCitations,
                getCitationNumber,
            }}
        >
            {children}
        </PresentationContext.Provider>
    );
}
