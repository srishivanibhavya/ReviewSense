"use client";

import { CheckCircle, XCircle, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/seperator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReviewData, ReviewPrediction } from "@/lib/types";

type ReviewHistoryProps = {
    history: Array<ReviewData & ReviewPrediction>;
};

export function ReviewHistory({ history }: ReviewHistoryProps) {
    if (history.length === 0) {
        return (
            <Card className="w-full h-full bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <Clock className="mr-2 h-5 w-5" />
                        Review History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <p className="text-muted-foreground">
                            Your analyzed reviews will appear here.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle className="text-xl flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Review History
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4 p-4">
                        {history.map((item, index) => {
                            const isHelpful = item.prediction?.includes("✅");
                            const confidenceValue = item.confidence
                                ? parseFloat(item.confidence.replace('%', ''))
                                : 0;

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 mr-2">
                                            <h3 className="font-medium text-sm line-clamp-1">{item.summary}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                {item.text}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-1">
                                            <Badge
                                                variant={isHelpful ? "outline" : "secondary"}
                                                className={cn(
                                                    "text-xs",
                                                    isHelpful
                                                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900"
                                                        : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900"
                                                )}
                                            >
                                                {isHelpful ? (
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                )}
                                                {confidenceValue.toFixed(0)}%
                                            </Badge>

                                            <div className="flex items-center text-xs text-amber-500">
                                                <Star className="h-3 w-3 mr-1 fill-amber-500" />
                                                <span>{item.score}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {index < history.length - 1 && <Separator />}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}