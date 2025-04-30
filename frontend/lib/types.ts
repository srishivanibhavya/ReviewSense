export interface ReviewData {
    summary: string;
    text: string;
    score: number;
    numerator: number;
    denominator: number;
}

export interface ReviewPrediction {
    prediction: string;
    confidence: string;
}