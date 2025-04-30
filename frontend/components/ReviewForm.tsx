"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ReviewData } from "@/lib/types";

const formSchema = z.object({
    summary: z.string().min(3, "Summary must be at least 3 characters"),
    text: z.string().min(10, "Review must be at least 10 characters"),
    score: z.enum(["1", "2", "3", "4", "5"], {
        required_error: "Please select a rating",
    }),
    numerator: z.coerce.number().int().positive("Must be a positive number"),
    denominator: z.coerce.number().int().positive("Must be a positive number"),
}).refine(data => data.numerator <= data.denominator, {
    message: "Numerator must be less than or equal to denominator",
    path: ["numerator"],
});

type ReviewFormProps = {
    onAnalyze: (data: ReviewData) => void;
    isAnalyzing: boolean;
};

export function ReviewForm({ onAnalyze, isAnalyzing }: ReviewFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            summary: "",
            text: "",
            score: "5",
            numerator: 0,
            denominator: 0,
        },
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onAnalyze({
            summary: values.summary,
            text: values.text,
            score: parseInt(values.score),
            numerator: values.numerator,
            denominator: values.denominator,
        });
    };

    return (
        <Card className="w-full transition-all duration-300 hover:shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl">Analyze Product Review</CardTitle>
                <CardDescription>
                    Enter a product review to analyze if it's helpful to potential buyers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Review Summary</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Great product, exceeded expectations!"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A brief title or summary of your review.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Review Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="This product has amazing build quality and arrived quickly. The packaging was secure and it works exactly as described..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The full text of your product review.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="score"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Star Rating</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a rating" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">★ (1 Star)</SelectItem>
                                                <SelectItem value="2">★★ (2 Stars)</SelectItem>
                                                <SelectItem value="3">★★★ (3 Stars)</SelectItem>
                                                <SelectItem value="4">★★★★ (4 Stars)</SelectItem>
                                                <SelectItem value="5">★★★★★ (5 Stars)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="numerator"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Helpfulness Votes</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Number of helpful votes
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="denominator"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Votes</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Total number of votes
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full md:w-auto"
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                "Analyze Helpfulness"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}