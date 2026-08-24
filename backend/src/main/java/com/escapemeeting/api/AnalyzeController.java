package com.escapemeeting.api;

import com.escapemeeting.service.MeetingAnalysisService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalyzeController {
    private final MeetingAnalysisService analysisService;

    public AnalyzeController(MeetingAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("ok");
    }

    @PostMapping("/analyze")
    public AnalyzeResponse analyze(@RequestBody AnalyzeRequest request) {
        return analysisService.analyze(request);
    }

    public record HealthResponse(String status) {
    }
}
