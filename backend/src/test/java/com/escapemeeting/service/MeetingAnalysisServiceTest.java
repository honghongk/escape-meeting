package com.escapemeeting.service;

import com.escapemeeting.api.AnalyzeRequest;
import com.escapemeeting.api.AnalyzeResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MeetingAnalysisServiceTest {
    private final MeetingAnalysisService service = new MeetingAnalysisService();

    @Test
    void calculatesTheConfiguredScore() {
        AnalyzeResponse result = service.analyze(new AnalyzeRequest(
                "ten", "peaceful", "none", "none", true
        ));

        assertEquals(100, result.probability());
        assertEquals("🏆 탈출 성공", result.statusTitle());
    }

    @Test
    void clampsTheLowestScoreToZero() {
        AnalyzeResponse result = service.analyze(new AnalyzeRequest(
                "three-hours", "ruined", "ongoing", "ceo", false
        ));

        assertEquals(0, result.probability());
        assertEquals("💀 이미 회의가 아닙니다", result.statusTitle());
        assertTrue(result.estimatedMinutes() > 0);
    }

    @Test
    void keepsMeetingTypeStableForTheSameInput() {
        AnalyzeRequest request = new AnalyzeRequest(
                "sixty", "silent", "once", "manager", false
        );

        assertEquals(service.analyze(request).meetingType(), service.analyze(request).meetingType());
    }
}
