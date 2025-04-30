"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReviewPrediction } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReviewResultProps = {
    prediction: ReviewPrediction | null;
    isLoading: boolean;
};

export function ReviewResult({ prediction, isLoading }: ReviewResultProps) {
    // Convert confidence from "92.4%" to 92.4
    const confidenceValue = prediction?.confidence
        ? parseFloat(prediction.confidence.replace('%', ''))
        : 0;

    const isHelpful = prediction?.prediction?.includes("✅");

    return (
        <Card className={cn(
            "w-full transition-all duration-300",
            isHelpful
                ? "border-green-200 dark:border-green-900"
                : "border-red-200 dark:border-red-900",
            isLoading && "animate-pulse"
        )}>
            <CardHeader className={cn(
                "pb-2",
                isHelpful
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
            )}>
                <CardTitle className="flex items-center text-2xl">
                    {isLoading ? (
                        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                    ) : isHelpful ? (
                        <>
                            <CheckCircle className="mr-2 h-6 w-6" />
                            <span>Review Is Helpful</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="mr-2 h-6 w-6" />
                            <span>Review Is Not Helpful</span>
                        </>
                    )}
                </CardTitle>
                <CardDescription className={cn(
                    "text-foreground/70",
                    isHelpful ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300",
                )}>
                    {isLoading ? (
                        <div className="h-4 w-32 bg-muted rounded animate-pulse mt-2" />
                    ) : prediction?.prediction || "Analysis result will appear here"}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Confidence</span>
                            <span className="text-sm font-medium">
                                {isLoading ? "Calculating..." : prediction?.confidence || "0%"}
                            </span>
                        </div>
                        {isLoading ? (
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        ) : (
                            <Progress
                                value={confidenceValue}
                                className={cn(
                                    "h-2",
                                    isHelpful
                                        ? "bg-green-100 dark:bg-green-950"
                                        : "bg-red-100 dark:bg-red-950"
                                )}
                                style={{
                                    backgroundColor: isHelpful
                                        ? 'bg-green-500 dark:bg-green-400'
                                        : 'bg-red-500 dark:bg-red-400'
                                }}
                            />
                        )}
                    </div>

                    {isLoading ? (
                        <div className="h-16 w-full bg-muted rounded animate-pulse" />
                    ) : prediction && (
                        <div className="text-sm text-muted-foreground">
                            <p>
                                {isHelpful
                                    ? "Your review was rated helpful because it contains specific details, relevant information, and clearly communicates your experience with the product."
                                    : "Your review may be more helpful if you add specific details about your experience, mention product features, and explain your reasoning for the rating."}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}