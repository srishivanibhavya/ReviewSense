import { ReviewData, ReviewPrediction } from "./types";
import { toast } from "sonner";

export async function analyzeReview(data: ReviewData): Promise<ReviewPrediction> {
    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();

        // Format the prediction to include the emoji
        const formattedPrediction = {
            prediction: result.prediction === "Helpful"
                ? "Helpful ✅"
                : "Not Helpful ❌",
            confidence: result.confidence
        };

        return formattedPrediction;
    } catch (error) {
        console.error("Failed to analyze review:", error);
        toast.error("Failed to analyze review. Please try again.");

        // Return a default prediction for error handling
        return {
            prediction: "Analysis Failed ❌",
            confidence: "0%"
        };
    }
}