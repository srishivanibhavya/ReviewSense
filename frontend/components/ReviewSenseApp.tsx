"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewResult } from "@/components/ReviewResult";
import { ReviewHistory } from "@/components/ReviewHistory";
import { Header } from "@/components/Header";
import { ReviewData, ReviewPrediction } from "@/lib/types";
import { analyzeReview } from "@/lib/api";

export function ReviewSenseApp() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState<ReviewPrediction | null>(null);
    const [history, setHistory] = useState<Array<ReviewData & ReviewPrediction>>([]);

    const handleAnalyze = async (reviewData: ReviewData) => {
        setIsAnalyzing(true);
        setPrediction(null);

        try {
            const result = await analyzeReview(reviewData);
            setPrediction(result);

            // Add to history
            setHistory((prev) => [
                { ...reviewData, ...result },
                ...prev.slice(0, 9), // Keep only 10 most recent
            ]);
        } catch (error) {
            console.error("Error analyzing review:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <ReviewForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                            {(prediction || isAnalyzing) && (
                                <div className="mt-8">
                                    <ReviewResult
                                        prediction={prediction}
                                        isLoading={isAnalyzing}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-4">
                            <ReviewHistory history={history} />
                        </div>
                    </div>
                </div>
            </div>
            <Toaster />
        </ThemeProvider>
    );
}