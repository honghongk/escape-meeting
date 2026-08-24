package com.escapemeeting.api;

import java.util.List;

public record AnalyzeResponse(
        int probability,
        String statusTitle,
        String statusMessage,
        int estimatedMinutes,
        String meetingType,
        List<Strategy> strategies
) {
    public record Strategy(String name, int probability, String note) {
    }
}
