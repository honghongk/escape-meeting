package com.escapemeeting.api;

public record AnalyzeRequest(
        String duration,
        String mood,
        String oneMore,
        String attendees,
        boolean hasEndTime
) {
}
