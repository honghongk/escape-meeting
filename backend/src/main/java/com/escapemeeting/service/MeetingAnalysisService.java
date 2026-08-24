package com.escapemeeting.service;

import com.escapemeeting.api.AnalyzeRequest;
import com.escapemeeting.api.AnalyzeResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MeetingAnalysisService {
    private static final Map<String, Integer> DURATION_SCORES = Map.of(
            "ten", 20,
            "thirty", 10,
            "sixty", 0,
            "one-twenty", -10,
            "three-hours", -20
    );
    private static final Map<String, Integer> MOOD_SCORES = Map.of(
            "peaceful", 20,
            "normal", 0,
            "silent", -10,
            "heated", -20,
            "ruined", -30
    );
    private static final Map<String, Integer> ONE_MORE_SCORES = Map.of(
            "none", 10,
            "once", 0,
            "three-plus", -15,
            "ongoing", -30
    );
    private static final Map<String, Integer> ATTENDEE_SCORES = Map.of(
            "none", 10,
            "manager", 0,
            "ceo", -15
    );
    private static final List<String> MEETING_TYPES = List.of(
            "🧟 좀비 회의", "🌀 무한 회의", "🗣️ 발언 독점 회의", "🔁 원점 회귀 회의",
            "📊 PPT 지옥", "🧩 일단 모여서 생각해보죠 회의", "🕳️ 결론 없는 회의",
            "💀 회의를 위한 회의", "🧘 아무도 말하지 않는 회의", "👑 대표님 아이디어 발표회"
    );

    public AnalyzeResponse analyze(AnalyzeRequest request) {
        int score = 50
                + scoreFor(DURATION_SCORES, request.duration())
                + scoreFor(MOOD_SCORES, request.mood())
                + scoreFor(ONE_MORE_SCORES, request.oneMore())
                + scoreFor(ATTENDEE_SCORES, request.attendees())
                + (request.hasEndTime() ? 15 : 0);
        int probability = Math.max(0, Math.min(100, score));
        int typeIndex = Math.floorMod(request.duration().hashCode()
                + request.mood().hashCode() + request.oneMore().hashCode(), MEETING_TYPES.size());

        return new AnalyzeResponse(
                probability,
                statusTitle(probability),
                statusMessage(probability),
                estimatedMinutes(probability, request.hasEndTime()),
                MEETING_TYPES.get(typeIndex),
                strategies(probability)
        );
    }

    private int scoreFor(Map<String, Integer> scores, String key) {
        return scores.getOrDefault(key, 0);
    }

    private String statusTitle(int probability) {
        if (probability <= 10) return "💀 이미 회의가 아닙니다";
        if (probability <= 30) return "🚨 탈출 난이도: 극악";
        if (probability <= 50) return "😐 탈출 가능성 있음";
        if (probability <= 70) return "🏃 슬슬 탈출각";
        if (probability <= 90) return "🎉 거의 다 왔습니다";
        return "🏆 탈출 성공";
    }

    private String statusMessage(int probability) {
        if (probability <= 10) return "새로운 회의가 시작되었습니다.";
        if (probability <= 30) return "지금 나가면 ‘어디 가세요?’를 들을 수 있습니다.";
        if (probability <= 50) return "누군가 먼저 ‘저는 이만...’을 말해주길 기다리세요.";
        if (probability <= 70) return "노트북을 닫아도 아무도 뭐라 하지 않을 확률이 높습니다.";
        if (probability <= 90) return "지금 화장실을 다녀와도 회의가 끝나 있을 가능성이 있습니다.";
        return "축하합니다. 오늘 회의에서 살아남았습니다.";
    }

    private int estimatedMinutes(int probability, boolean hasEndTime) {
        int minutes = 90 - (probability * 2 / 3);
        return Math.max(hasEndTime ? 10 : 5, minutes);
    }

    private List<AnalyzeResponse.Strategy> strategies(int probability) {
        return List.of(
                new AnalyzeResponse.Strategy("화장실 전략", Math.min(95, probability + 21), "가장 자연스럽게 자리를 비울 수 있습니다."),
                new AnalyzeResponse.Strategy("제가 다음 일정이 있어서...", Math.min(90, probability + 8), "일정 캘린더를 미리 열어두세요."),
                new AnalyzeResponse.Strategy("노트북 닫기", Math.max(3, probability / 3), "시선이 모일 수 있으니 타이밍이 중요합니다."),
                new AnalyzeResponse.Strategy("그냥 나가기", Math.max(1, probability / 10), "추천하지 않습니다.")
        );
    }
}
