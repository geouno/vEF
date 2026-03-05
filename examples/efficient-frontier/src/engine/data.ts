/**
 * Sample datasets for the Efficient Frontier presentation.
 */
import type { EFInput } from "./solver";

/** Classic 5-asset example: US Equities, Intl Equities, Bonds, Real Estate, Commodities */
export const FIVE_ASSET_PORTFOLIO: EFInput = {
    assets: [
        { name: "US Equity", expectedReturn: 0.10 },
        { name: "Intl Equity", expectedReturn: 0.09 },
        { name: "Bonds", expectedReturn: 0.04 },
        { name: "Real Estate", expectedReturn: 0.08 },
        { name: "Commodities", expectedReturn: 0.06 },
    ],
    covarianceMatrix: [
        [0.0225, 0.0180, 0.0020, 0.0090, 0.0060],
        [0.0180, 0.0256, 0.0015, 0.0100, 0.0080],
        [0.0020, 0.0015, 0.0016, 0.0010, 0.0005],
        [0.0090, 0.0100, 0.0010, 0.0196, 0.0050],
        [0.0060, 0.0080, 0.0005, 0.0050, 0.0144],
    ],
    riskFreeRate: 0.02,
    resolution: 300,
};

/** Minimal 3-asset for didactic slides */
export const THREE_ASSET_SIMPLE: EFInput = {
    assets: [
        { name: "Stocks", expectedReturn: 0.12 },
        { name: "Bonds", expectedReturn: 0.04 },
        { name: "Gold", expectedReturn: 0.06 },
    ],
    covarianceMatrix: [
        [0.04, 0.006, -0.002],
        [0.006, 0.01, 0.002],
        [-0.002, 0.002, 0.025],
    ],
    riskFreeRate: 0.02,
    resolution: 300,
};
