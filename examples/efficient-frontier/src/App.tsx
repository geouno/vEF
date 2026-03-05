import { SlideDeck, Slide, TwoChart, type ChartSeries, type ScatterPoint } from "vef";
import { solve } from "./engine/solver";
import { FIVE_ASSET_PORTFOLIO, THREE_ASSET_SIMPLE } from "./engine/data";
import { useMemo, useState } from "react";

// ─── Pre-compute results ────────────────────────────────────

function useEF(input: typeof FIVE_ASSET_PORTFOLIO) {
    return useMemo(() => solve(input), [input]);
}

// ─── Utility: format % ──────────────────────────────────────

const pct = (v: number) => (v * 100).toFixed(1) + "%";

// ─── Slide Components ────────────────────────────────────────

function TitleSlide() {
    return (
        <Slide className="title-slide">
            <h1>The Efficient Frontier</h1>
            <h2>Modern Portfolio Theory — Markowitz (1952)</h2>
            <p className="subtitle-detail">
                How to construct portfolios that maximise return for a given level of risk
            </p>
        </Slide>
    );
}

function ConceptSlide() {
    return (
        <Slide>
            <h1>What is the Efficient Frontier?</h1>
            <ul className="slide-list">
                <li>
                    <strong>The set of optimal portfolios</strong> that offer the highest
                    expected return for a defined level of risk
                </li>
                <li>
                    Portfolios below the frontier are <em>sub-optimal</em> — you can get
                    more return for the same risk
                </li>
                <li>
                    Derived from <strong>mean-variance optimisation</strong>: minimise
                    portfolio variance subject to a target return
                </li>
                <li>
                    The <span className="accent">tangency portfolio</span> maximises the
                    Sharpe ratio — the best risk-adjusted return
                </li>
            </ul>
        </Slide>
    );
}

function SimpleEFSlide() {
    const result = useEF(THREE_ASSET_SIMPLE);

    const frontierSeries: ChartSeries = {
        points: result.frontier.map((p) => ({ x: p.risk, y: p.expectedReturn })),
        color: "#6c63ff",
        lineWidth: 3,
        label: "Efficient Frontier",
    };

    const assetScatter: ScatterPoint[] = result.assetPoints.map((a) => ({
        x: a.risk,
        y: a.expectedReturn,
        color: "#4ecdc4",
        radius: 6,
        label: a.name,
    }));

    const tangencyPoint: ScatterPoint = {
        x: result.tangency.risk,
        y: result.tangency.expectedReturn,
        color: "#ffd93d",
        radius: 8,
        label: `Tangency (Sharpe ${result.tangency.sharpe.toFixed(2)})`,
    };

    const mvPoint: ScatterPoint = {
        x: result.minVariance.risk,
        y: result.minVariance.expectedReturn,
        color: "#ff6b6b",
        radius: 7,
        label: "Min Variance",
    };

    return (
        <Slide>
            <h1>3-Asset Example</h1>
            <h2>Stocks · Bonds · Gold</h2>
            <TwoChart
                series={[frontierSeries]}
                scatter={[...assetScatter, tangencyPoint, mvPoint]}
                xLabel="Risk (σ)"
                yLabel="Expected Return"
            />
        </Slide>
    );
}

function FiveAssetSlide() {
    const result = useEF(FIVE_ASSET_PORTFOLIO);

    const frontierSeries: ChartSeries = {
        points: result.frontier.map((p) => ({ x: p.risk, y: p.expectedReturn })),
        color: "#6c63ff",
        lineWidth: 3,
    };

    const assetScatter: ScatterPoint[] = result.assetPoints.map((a) => ({
        x: a.risk,
        y: a.expectedReturn,
        color: "#4ecdc4",
        radius: 6,
        label: a.name,
    }));

    const tangencyPoint: ScatterPoint = {
        x: result.tangency.risk,
        y: result.tangency.expectedReturn,
        color: "#f59f00",
        radius: 8,
        label: `Tangency (Sharpe ${result.tangency.sharpe.toFixed(2)})`,
    };

    const mvPoint: ScatterPoint = {
        x: result.minVariance.risk,
        y: result.minVariance.expectedReturn,
        color: "#f03e3e",
        radius: 7,
        label: "Min Variance",
    };

    return (
        <Slide>
            <h1>5-Asset Diversified Portfolio</h1>
            <h2>US Equity · Intl Equity · Bonds · Real Estate · Commodities</h2>
            <TwoChart
                series={[frontierSeries]}
                scatter={[...assetScatter, tangencyPoint, mvPoint]}
                xLabel="Risk (σ)"
                yLabel="Expected Return"
            />
        </Slide>
    );
}

function WeightsSlide() {
    const result = useEF(FIVE_ASSET_PORTFOLIO);
    const { tangency, minVariance } = result;
    const names = FIVE_ASSET_PORTFOLIO.assets.map((a) => a.name);

    return (
        <Slide>
            <h1>Optimal Weights</h1>
            <div className="weights-grid">
                <div className="weight-col">
                    <h3>
                        <span className="dot dot-yellow" /> Tangency Portfolio
                    </h3>
                    <table className="weight-table">
                        <thead>
                            <tr><th>Asset</th><th>Weight</th></tr>
                        </thead>
                        <tbody>
                            {names.map((name, i) => (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td>{pct(tangency.weights[i])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="weight-metric">
                        Sharpe: <strong>{tangency.sharpe.toFixed(3)}</strong>
                    </p>
                </div>
                <div className="weight-col">
                    <h3>
                        <span className="dot dot-red" /> Min-Variance Portfolio
                    </h3>
                    <table className="weight-table">
                        <thead>
                            <tr><th>Asset</th><th>Weight</th></tr>
                        </thead>
                        <tbody>
                            {names.map((name, i) => (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td>{pct(minVariance.weights[i])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="weight-metric">
                        Return: <strong>{pct(minVariance.expectedReturn)}</strong> · Risk:{" "}
                        <strong>{pct(minVariance.risk)}</strong>
                    </p>
                </div>
            </div>
        </Slide>
    );
}

function InteractiveSlide() {
    const [rf, setRf] = useState(0.02);
    const input = useMemo(
        () => ({ ...FIVE_ASSET_PORTFOLIO, riskFreeRate: rf }),
        [rf]
    );
    const result = useEF(input);

    const frontierSeries: ChartSeries = {
        points: result.frontier.map((p) => ({ x: p.risk, y: p.expectedReturn })),
        color: "#6c63ff",
        lineWidth: 3,
    };

    // Capital Market Line (from rf through tangency)
    const cmlEnd = result.tangency.risk * 2.5;
    const cmlSeries: ChartSeries = {
        points: [
            { x: 0, y: rf },
            { x: cmlEnd, y: rf + result.tangency.sharpe * cmlEnd },
        ],
        color: "rgba(245,159,0,0.5)",
        lineWidth: 2,
        label: "CML",
    };

    const tangencyPoint: ScatterPoint = {
        x: result.tangency.risk,
        y: result.tangency.expectedReturn,
        color: "#f59f00",
        radius: 8,
        label: `Tangency (Sharpe ${result.tangency.sharpe.toFixed(2)})`,
    };

    return (
        <Slide>
            <h1>Interactive: Risk-Free Rate</h1>
            <div className="slider-row">
                <label>
                    r<sub>f</sub> = {pct(rf)}
                </label>
                <input
                    type="range"
                    min={0}
                    max={0.08}
                    step={0.005}
                    value={rf}
                    onChange={(e) => setRf(parseFloat(e.target.value))}
                    className="styled-slider"
                />
            </div>
            <TwoChart
                series={[frontierSeries, cmlSeries]}
                scatter={[tangencyPoint]}
                xLabel="Risk (σ)"
                yLabel="Expected Return"
            />
        </Slide>
    );
}

function TakeawaySlide() {
    return (
        <Slide className="title-slide">
            <h1>Key Takeaways</h1>
            <ul className="slide-list">
                <li>
                    Diversification creates portfolios with <strong>better risk-return
                        trade-offs</strong> than any individual asset
                </li>
                <li>
                    The <span className="accent">tangency portfolio</span> is the best
                    risk-adjusted investment — combine it with borrowing/lending at r<sub>f</sub>
                </li>
                <li>
                    The frontier shape depends on <strong>correlations</strong> — lower
                    correlations expand the opportunity set
                </li>
            </ul>
        </Slide>
    );
}

// ─── App ─────────────────────────────────────────────────────

export default function App() {
    return (
        <SlideDeck>
            <TitleSlide />
            <ConceptSlide />
            <SimpleEFSlide />
            <FiveAssetSlide />
            <WeightsSlide />
            <InteractiveSlide />
            <TakeawaySlide />
        </SlideDeck>
    );
}
