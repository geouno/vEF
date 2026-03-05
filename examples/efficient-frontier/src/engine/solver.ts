/**
 * Efficient Frontier solver — pure TypeScript, zero dependencies.
 *
 * Given a set of assets with expected returns and a covariance matrix,
 * produces the mean-variance frontier by sweeping target returns and
 * solving for minimum-variance portfolios via the closed-form
 * two-fund theorem (analytic solution, no iterative optimizer needed).
 */

// ─── Types ───────────────────────────────────────────────────

export interface Asset {
    name: string;
    expectedReturn: number;
}

export interface EFInput {
    assets: Asset[];
    covarianceMatrix: number[][];
    riskFreeRate: number;
    /** Number of points along the frontier curve */
    resolution?: number;
}

export interface PortfolioPoint {
    /** Annualised standard deviation */
    risk: number;
    /** Annualised expected return */
    expectedReturn: number;
    /** Weight per asset (same order as input assets) */
    weights: number[];
    /** Sharpe ratio relative to risk-free rate */
    sharpe: number;
}

export interface EFOutput {
    frontier: PortfolioPoint[];
    /** Global minimum-variance portfolio */
    minVariance: PortfolioPoint;
    /** Maximum Sharpe (tangency) portfolio */
    tangency: PortfolioPoint;
    /** Suboptimal branch of the frontier (below min-variance) */
    suboptimalFrontier: PortfolioPoint[];
    /** Individual asset positions for scatter overlay */
    assetPoints: { name: string; risk: number; expectedReturn: number }[];
}

// ─── Linear Algebra Helpers ──────────────────────────────────

function invertMatrix(M: number[][]): number[][] {
    const n = M.length;
    // Augment with identity
    const aug = M.map((row, i) => [
        ...row.map((v) => v),
        ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    ]);

    for (let col = 0; col < n; col++) {
        // Partial pivot
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
        }
        [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

        const pivot = aug[col][col];
        if (Math.abs(pivot) < 1e-12) throw new Error("Singular covariance matrix");

        for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;

        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = aug[row][col];
            for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
        }
    }

    return aug.map((row) => row.slice(n));
}

function dot(a: number[], b: number[]): number {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
}

function matVec(M: number[][], v: number[]): number[] {
    return M.map((row) => dot(row, v));
}

// ─── Solver ──────────────────────────────────────────────────

export function solve(input: EFInput): EFOutput {
    const { assets, covarianceMatrix: Sigma, riskFreeRate: rf } = input;
    const n = assets.length;
    const resolution = input.resolution ?? 200;
    const mu = assets.map((a) => a.expectedReturn);
    const ones = Array(n).fill(1);

    const SigmaInv = invertMatrix(Sigma);

    // Merton constants  A = 1' Σ⁻¹ μ,  B = μ' Σ⁻¹ μ,  C = 1' Σ⁻¹ 1
    const SigmaInvMu = matVec(SigmaInv, mu);
    const SigmaInv1 = matVec(SigmaInv, ones);

    const A = dot(ones, SigmaInvMu); // = 1'Σ⁻¹μ
    const B = dot(mu, SigmaInvMu); // = μ'Σ⁻¹μ
    const C = dot(ones, SigmaInv1); // = 1'Σ⁻¹1
    const D = B * C - A * A; // determinant

    // ─ Sweep target return ─
    const muMin = A / C; // return of min-variance portfolio
    const muMax = Math.max(...mu) * 1.25;
    const step = (muMax - muMin) / resolution;

    const frontier: PortfolioPoint[] = [];
    const suboptimalFrontier: PortfolioPoint[] = [];

    const getPoint = (target: number): PortfolioPoint => {
        const weights = Array(n);
        for (let j = 0; j < n; j++) {
            const g = (B * SigmaInv1[j] - A * SigmaInvMu[j]) / D;
            const h = (C * SigmaInvMu[j] - A * SigmaInv1[j]) / D;
            weights[j] = g + h * target;
        }

        // Portfolio variance: w' Σ w
        let variance = 0;
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                variance += weights[j] * weights[k] * Sigma[j][k];
            }
        }
        const risk = Math.sqrt(Math.max(variance, 0));
        const sharpe = risk > 0 ? (target - rf) / risk : 0;

        return { risk, expectedReturn: target, weights, sharpe };
    };

    for (let i = 0; i <= resolution; i++) {
        frontier.push(getPoint(muMin + i * step));
        suboptimalFrontier.push(getPoint(muMin - i * step));
    }

    // ─ Min-variance portfolio ─
    const mvWeights = SigmaInv1.map((v) => v / C);
    let mvVar = 0;
    for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++) mvVar += mvWeights[j] * mvWeights[k] * Sigma[j][k];
    const minVariance: PortfolioPoint = {
        risk: Math.sqrt(Math.max(mvVar, 0)),
        expectedReturn: muMin,
        weights: mvWeights,
        sharpe: Math.sqrt(Math.max(mvVar, 0)) > 0 ? (muMin - rf) / Math.sqrt(Math.max(mvVar, 0)) : 0,
    };

    // ─ Tangency (max Sharpe) portfolio ─
    const excessMu = mu.map((m) => m - rf);
    const SigmaInvExcess = matVec(SigmaInv, excessMu);
    const sumSIE = SigmaInvExcess.reduce((a, b) => a + b, 0);
    const tWeights = SigmaInvExcess.map((v) => v / sumSIE);
    const tReturn = dot(tWeights, mu);
    let tVar = 0;
    for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++) tVar += tWeights[j] * tWeights[k] * Sigma[j][k];
    const tangency: PortfolioPoint = {
        risk: Math.sqrt(Math.max(tVar, 0)),
        expectedReturn: tReturn,
        weights: tWeights,
        sharpe: Math.sqrt(Math.max(tVar, 0)) > 0 ? (tReturn - rf) / Math.sqrt(Math.max(tVar, 0)) : 0,
    };

    // ─ Individual asset points ─
    const assetPoints = assets.map((a, i) => ({
        name: a.name,
        risk: Math.sqrt(Sigma[i][i]),
        expectedReturn: a.expectedReturn,
    }));

    return { frontier, suboptimalFrontier, minVariance, tangency, assetPoints };
}
