import { useEffect, useRef, useCallback } from "react";
import Two from "two.js";

export interface Point {
    x: number;
    y: number;
}

export interface ChartSeries {
    points: Point[];
    color: string;
    lineWidth?: number;
    lineDash?: number[];
    label?: string;
}

export interface ScatterPoint extends Point {
    radius?: number;
    color?: string;
    label?: string;
}

export interface TwoChartProps {
    width?: number;
    height?: number;
    series?: ChartSeries[];
    scatter?: ScatterPoint[];
    xLabel?: string;
    yLabel?: string;
    title?: string;
    padding?: { top: number; right: number; bottom: number; left: number };
}

const DEFAULT_PADDING = { top: 40, right: 40, bottom: 60, left: 72 };

/**
 * Reusable Two.js SVG chart component.
 * Renders line series and scatter points on a coordinate system.
 */
export function TwoChart({
    width = 900,
    height = 480,
    series = [],
    scatter = [],
    xLabel = "",
    yLabel = "",
    title = "",
    padding = DEFAULT_PADDING,
}: TwoChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const twoRef = useRef<Two | null>(null);

    const allPoints = [
        ...series.flatMap((s) => s.points),
        ...scatter,
    ];

    const xMin = Math.min(...allPoints.map((p) => p.x));
    const xMax = Math.max(...allPoints.map((p) => p.x));
    const yMin = Math.min(...allPoints.map((p) => p.y));
    const yMax = Math.max(...allPoints.map((p) => p.y));

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const toScreenX = useCallback(
        (val: number) => padding.left + ((val - xMin) / (xMax - xMin || 1)) * chartW,
        [padding.left, xMin, xMax, chartW]
    );
    const toScreenY = useCallback(
        (val: number) => padding.top + chartH - ((val - yMin) / (yMax - yMin || 1)) * chartH,
        [padding.top, chartH, yMin, yMax]
    );

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Clean previous
        if (twoRef.current) {
            twoRef.current.clear();
            twoRef.current.pause(); // stop any background loops
        }

        // Physically remove the old SVG from the DOM to avoid duplication
        el.innerHTML = "";

        const two = new Two({
            type: Two.Types.svg,
            width,
            height,
        }).appendTo(el);

        twoRef.current = two;

        // ── Grid lines ──
        const gridColor = "rgba(0,0,0,0.06)";
        const tickCount = 6;
        for (let i = 0; i <= tickCount; i++) {
            const frac = i / tickCount;

            // Horizontal
            const gy = padding.top + chartH * (1 - frac);
            const hLine = two.makeLine(padding.left, gy, padding.left + chartW, gy);
            hLine.stroke = gridColor;
            hLine.linewidth = 1;

            // Vertical
            const gx = padding.left + chartW * frac;
            const vLine = two.makeLine(gx, padding.top, gx, padding.top + chartH);
            vLine.stroke = gridColor;
            vLine.linewidth = 1;

            // X tick labels
            const xTickVal = xMin + frac * (xMax - xMin);
            const xTick = two.makeText(
                xTickVal.toFixed(2),
                gx,
                padding.top + chartH + 20,
            );
            xTick.fill = "#868e96";
            xTick.size = 11;
            xTick.family = "Inter, sans-serif";

            // Y tick labels
            const yTickVal = yMin + frac * (yMax - yMin);
            const yTick = two.makeText(
                yTickVal.toFixed(2),
                padding.left - 16,
                gy,
            );
            yTick.fill = "#868e96";
            yTick.size = 11;
            yTick.family = "Inter, sans-serif";
            yTick.alignment = "right";
        }

        // ── Axes ──
        const axisColor = "rgba(0,0,0,0.15)";
        const xAxis = two.makeLine(
            padding.left, padding.top + chartH,
            padding.left + chartW, padding.top + chartH
        );
        xAxis.stroke = axisColor;
        xAxis.linewidth = 1.5;

        const yAxis = two.makeLine(
            padding.left, padding.top,
            padding.left, padding.top + chartH
        );
        yAxis.stroke = axisColor;
        yAxis.linewidth = 1.5;

        // ── Axis labels ──
        if (xLabel) {
            const xl = two.makeText(xLabel, padding.left + chartW / 2, height - 12);
            xl.fill = "#495057";
            xl.size = 13;
            xl.family = "Inter, sans-serif";
            xl.weight = 500;
        }
        if (yLabel) {
            const yl = two.makeText(yLabel, 16, padding.top + chartH / 2);
            yl.fill = "#495057";
            yl.size = 13;
            yl.family = "Inter, sans-serif";
            yl.weight = 500;
            yl.rotation = -Math.PI / 2;
        }
        if (title) {
            const tl = two.makeText(title, width / 2, 20);
            tl.fill = "#212529";
            tl.size = 16;
            tl.family = "Inter, sans-serif";
            tl.weight = 700;
        }

        // ── Series (lines / curves) ──
        for (const s of series) {
            if (s.points.length < 2) continue;
            const anchors = s.points.map(
                (p) => new Two.Anchor(toScreenX(p.x), toScreenY(p.y))
            );
            const path = two.makePath(anchors);
            path.noFill();
            path.stroke = s.color;
            path.linewidth = s.lineWidth ?? 2.5;
            path.curved = true;
            path.closed = false;
            path.cap = "round";
            path.join = "round";
            if (s.lineDash) {
                path.dashes = s.lineDash;
            }
        }

        // ── Scatter points ──
        for (const sp of scatter) {
            const cx = toScreenX(sp.x);
            const cy = toScreenY(sp.y);
            const r = sp.radius ?? 5;
            const circle = two.makeCircle(cx, cy, r);
            circle.fill = sp.color ?? "#6c63ff";
            circle.noStroke();

            // Glow effect
            const glow = two.makeCircle(cx, cy, r + 4);
            glow.fill = (sp.color ?? "#6c63ff") + "40";
            glow.noStroke();

            if (sp.label) {
                const lbl = two.makeText(sp.label, cx + r + 8, cy - 2);
                lbl.fill = "#495057";
                lbl.size = 11;
                lbl.family = "Inter, sans-serif";
                lbl.alignment = "left";
            }
        }

        two.update();

        return () => {
            two.pause();
            two.clear();
            twoRef.current = null;
        };
    }, [width, height, series, scatter, xLabel, yLabel, title, padding, toScreenX, toScreenY, chartW, chartH, xMin, xMax, yMin, yMax]);

    return <div ref={containerRef} className="chart-container" />;
}
