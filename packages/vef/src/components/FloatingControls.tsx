import { usePresentation } from "./PresentationProvider";
import { useState } from "react";

export function FloatingControls() {
    const { currentSlide, totalSlides, prevSlide, nextSlide, printToPDF } = usePresentation();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="floating-controls print-hidden">
            <div className="fc-left">
                <div className="fc-brand">
                    <span>vEF</span>
                </div>
            </div>

            <div className="fc-center">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="fc-button"
                    title="Previous Slide"
                >
                    ←
                </button>
                <span className="fc-slide-counter">
                    {currentSlide + 1} / {totalSlides || "-"}
                </span>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className="fc-button"
                    title="Next Slide"
                >
                    →
                </button>
            </div>

            <div className="fc-right">
                <div className="fc-dropdown-container">
                    <button
                        className="fc-button fc-icon-button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        title="Settings"
                    >
                        ⚙️
                    </button>
                    {menuOpen && (
                        <div className="fc-dropdown-menu">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    printToPDF();
                                }}
                                className="fc-dropdown-item"
                            >
                                🖨️ Print to PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
