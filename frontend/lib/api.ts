import { ReviewData, ReviewPrediction } from "./types";

export async function analyzeReview(data: ReviewData): Promise<ReviewPrediction> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to analyze");

  return await res.json();
}
