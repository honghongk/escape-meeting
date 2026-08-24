"use client";

import { useState } from "react";

type Phase = "start" | "questions" | "analyzing" | "result";

type Answers = {
  duration: string;
  mood: string;
  oneMore: string;
  attendees: string;
  hasEndTime: boolean;
};

type Strategy = {
  name: string;
  probability: number;
  note: string;
};

type Analysis = {
  probability: number;
  statusTitle: string;
  statusMessage: string;
  estimatedMinutes: number;
  meetingType: string;
  strategies: Strategy[];
};

const questions = [
  {
    key: "duration",
    eyebrow: "Q1 · 회의 시간",
    title: "회의를 시작한 지 얼마나 됐나요?",
    options: [
      ["ten", "10분 이하"],
      ["thirty", "30분"],
      ["sixty", "1시간"],
      ["one-twenty", "2시간"],
      ["three-hours", "3시간 이상"],
    ],
  },
  {
    key: "mood",
    eyebrow: "Q2 · 회의 분위기",
    title: "지금 회의 분위기는 어떤가요?",
    options: [
      ["peaceful", "😌 평화로움"],
      ["normal", "😐 그냥 그럼"],
      ["silent", "😶 아무도 말하지 않음"],
      ["heated", "🔥 누군가 화남"],
      ["ruined", "💀 이미 망함"],
    ],
  },
  {
    key: "oneMore",
    eyebrow: "Q3 · 마지막으로 하나만 더",
    title: "‘마지막으로 하나만 더’가 나왔나요?",
    options: [
      ["none", "아직 안 나옴"],
      ["once", "한 번 나옴"],
      ["three-plus", "3번 이상 나옴"],
      ["ongoing", "지금도 말하는 중"],
    ],
  },
  {
    key: "attendees",
    eyebrow: "Q4 · 참석자",
    title: "상사가 참석했나요?",
    options: [
      ["none", "없음"],
      ["manager", "상사 참석"],
      ["ceo", "대표님까지 참석"],
    ],
  },
  {
    key: "hasEndTime",
    eyebrow: "Q5 · 종료 예정",
    title: "회의 종료 예정 시간이 있나요?",
    options: [
      ["false", "없음"],
      ["true", "있음"],
    ],
  },
] as const;

const initialAnswers: Answers = {
  duration: "",
  mood: "",
  oneMore: "",
  attendees: "",
  hasEndTime: false,
};

const analysisLines = [
  "회의 데이터를 분석하고 있습니다...",
  "회의실 온도 분석 중...",
  "상사 표정 분석 중...",
  "‘하나만 더’ 횟수 계산 중...",
  "퇴근 가능성 계산 중...",
];

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export default function Home() {
  const [phase, setPhase] = useState<Phase>("start");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisLine, setAnalysisLine] = useState(0);
  const [error, setError] = useState("");
  const [shareLabel, setShareLabel] = useState("결과 공유");

  const currentQuestion = questions[step];
  const currentValue = answers[currentQuestion.key];
  const canContinue = typeof currentValue === "boolean" || Boolean(currentValue);

  function startQuestions() {
    setPhase("questions");
    setStep(0);
  }

  function selectAnswer(value: string) {
    const key = currentQuestion.key;
    setAnswers((current) => ({
      ...current,
      [key]: key === "hasEndTime" ? value === "true" : value,
    }));
  }

  async function submitAnalysis() {
    setPhase("analyzing");
    setError("");
    setAnalysisLine(0);

    const lineTimer = window.setInterval(() => {
      setAnalysisLine((current) => (current + 1) % analysisLines.length);
    }, 260);

    try {
      const response = await fetch(`${apiBaseUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        throw new Error("분석 요청에 실패했습니다.");
      }

      const result: Analysis = await response.json();
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      setAnalysis(result);
      setPhase("result");
    } catch {
      setError("회의 분석 서버와 연결하지 못했습니다. 잠시 후 다시 시도해주세요.");
      setPhase("questions");
    } finally {
      window.clearInterval(lineTimer);
    }
  }

  function nextStep() {
    if (!canContinue) return;
    if (step < questions.length - 1) {
      setStep((current) => current + 1);
    } else {
      void submitAnalysis();
    }
  }

  function previousStep() {
    if (step === 0) {
      setPhase("start");
    } else {
      setStep((current) => current - 1);
    }
  }

  async function shareResult() {
    if (!analysis) return;
    const text = [
      `회의 탈출 확률 ${analysis.probability}%`,
      analysis.statusTitle,
      `예상 탈출 시간 ${analysis.estimatedMinutes}분`,
      `회의 유형 ${analysis.meetingType}`,
      "너희 회사는 몇 %임?",
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "회의 탈출 확률", text });
        setShareLabel("공유 완료");
      } else {
        await navigator.clipboard.writeText(text);
        setShareLabel("복사 완료");
      }
    } catch {
      setShareLabel("공유 취소");
    }
    window.setTimeout(() => setShareLabel("결과 공유"), 1800);
  }

  function reset() {
    setPhase("start");
    setStep(0);
    setAnswers(initialAnswers);
    setAnalysis(null);
    setError("");
    setShareLabel("결과 공유");
  }

  return (
    <main className={`app-shell phase-${phase}`}>
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <span className="brand-mark">MEETING / ESCAPE</span>
        <span className="edition">알고리즘 v1.3</span>
      </header>

      {phase === "start" && (
        <section className="hero-panel" aria-labelledby="start-title">
          <div className="hero-copy">
            <p className="kicker">회의 생존 시뮬레이터</p>
            <h1 id="start-title">
              이 회의,
              <br />
              <em>언제 끝날까요?</em>
            </h1>
            <p className="hero-description">
              회의 상황을 몇 가지만 알려주면
              <br />
              탈출 가능성을 아주 진지하게 분석해드립니다.
            </p>
          </div>
          <div className="hero-action">
            <div className="status-stamp">
              <span>NO. 008</span>
              <strong>회의 종료<br />예측 시스템</strong>
            </div>
            <button className="primary-button" onClick={startQuestions}>
              계산하기 <span aria-hidden="true">↗</span>
            </button>
            <p className="microcopy">소요 시간 약 10초 · 근거 없음</p>
          </div>
        </section>
      )}

      {phase === "questions" && (
        <section className="question-panel" aria-labelledby="question-title">
          <div className="progress-row">
            <button className="back-button" onClick={previousStep} aria-label="이전으로">←</button>
            <div className="progress-track" aria-label={`${step + 1} / ${questions.length}`}>
              {questions.map((question, index) => (
                <span key={question.key} className={index <= step ? "active" : ""} />
              ))}
            </div>
            <span className="progress-count">{String(step + 1).padStart(2, "0")} / 05</span>
          </div>
          <div className="question-copy">
            <p className="kicker">{currentQuestion.eyebrow}</p>
            <h2 id="question-title">{currentQuestion.title}</h2>
          </div>
          <div className="option-grid">
            {currentQuestion.options.map(([value, label]) => (
              <button
                key={value}
                className={`option-button ${currentValue === (currentQuestion.key === "hasEndTime" ? value === "true" : value) ? "selected" : ""}`}
                onClick={() => selectAnswer(value)}
              >
                <span>{label}</span>
                <span className="option-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="continue-button" disabled={!canContinue} onClick={nextStep}>
            {step === questions.length - 1 ? "분석 시작" : "다음 질문"} <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      {phase === "analyzing" && (
        <section className="analyzing-panel" aria-live="polite">
          <div className="radar" aria-hidden="true"><span /><span /><span /></div>
          <p className="kicker">회의 탈출 확률 알고리즘</p>
          <h2>상황을 분석하는 중입니다<span className="ellipsis">...</span></h2>
          <p className="analysis-line">{analysisLines[analysisLine]}</p>
          <div className="fake-progress"><span /></div>
          <p className="microcopy">회의실의 모든 변수를 계산하고 있습니다.</p>
        </section>
      )}

      {phase === "result" && analysis && (
        <section className="result-panel" aria-labelledby="result-title">
          <div className="result-heading">
            <div>
              <p className="kicker">분석 완료 · {analysis.meetingType}</p>
              <h2 id="result-title">당신의 회의 탈출 확률</h2>
            </div>
            <button className="reset-icon" onClick={reset} aria-label="다시 계산하기">↻</button>
          </div>
          <div className="probability-block">
            <span className="probability-number">{analysis.probability}</span><span className="probability-unit">%</span>
            <div className="probability-bar"><span style={{ width: `${analysis.probability}%` }} /></div>
            <strong className="status-title">{analysis.statusTitle}</strong>
            <p className="status-message">{analysis.statusMessage}</p>
          </div>
          <div className="result-details">
            <div className="detail-item"><span>예상 탈출 시간</span><strong>{analysis.estimatedMinutes}분 후</strong></div>
            <div className="detail-item"><span>회의 유형</span><strong>{analysis.meetingType}</strong></div>
          </div>
          <div className="strategy-section">
            <div className="section-label"><span>현재 탈출 전략</span><span>SUCCESS RATE</span></div>
            <div className="strategy-list">
              {analysis.strategies.map((strategy, index) => (
                <div className="strategy-row" key={strategy.name}>
                  <span className="strategy-rank">{index === 3 ? "☠" : `0${index + 1}`}</span>
                  <div><strong>{strategy.name}</strong><small>{strategy.note}</small></div>
                  <b>{strategy.probability}%</b>
                </div>
              ))}
            </div>
          </div>
          <button className="share-button" onClick={() => void shareResult()}>{shareLabel} <span aria-hidden="true">↗</span></button>
          <p className="result-footer">회의 시간 · 분위기 · 참석자 · “하나만 더” 종합 분석</p>
        </section>
      )}
    </main>
  );
}
