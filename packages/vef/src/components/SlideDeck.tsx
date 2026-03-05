import { useState, useCallback, useEffect, type ReactNode } from "react";

export interface SlideProps {
    children: ReactNode;
    className?: string;
}

export function Slide({ children, className = "" }: SlideProps) {
    return <div className={`slide ${className}`}>{children}</div>;
}

export interface SlideDeckProps {
    children: ReactNode[];
}

export function SlideDeck({ children }: SlideDeckProps) {
    const [current, setCurrent] = useState(0);
    const total = children.length;

    const next = useCallback(() => {
        setCurrent((i) => Math.min(i + 1, total - 1));
    }, [total]);

    const prev = useCallback(() => {
        setCurrent((i) => Math.max(i - 1, 0));
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                next();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                prev();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [next, prev]);

    return (
        <div className="slide-deck">
            {children[current]}
            <span className="slide-number">
                {current + 1} / {total}
            </span>
            <div className="nav-controls">
                <button onClick={prev} disabled={current === 0}>
                    ← Prev
                </button>
                <button onClick={next} disabled={current === total - 1}>
                    Next →
                </button>
            </div>
        </div>
    );
}
