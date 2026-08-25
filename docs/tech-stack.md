# 기술 스택

## 개발 원칙

로컬 환경에는 Java, Node.js, npm, pnpm을 직접 설치하지 않는다. 호스트에는 Docker Desktop만 설치하고, 프론트엔드와 백엔드의 실행 환경은 Docker Compose로 통일한다.


## 원격 실행

로컬에서 Docker를 실행할 필요는 없다. Docker Desktop 또는 Docker Engine과 Compose 플러그인이 설치된 원격 환경에서 저장소를 받은 뒤 실행한다.

```bash
git clone <repository-url>
cd escape-meeting
```

브라우저에서는 원격 서버의 `10000` 포트로 접속한다. 방화벽이나 보안 그룹을 사용하는 환경이라면 `10000/tcp`만 외부에 열면 된다. 백엔드 `8080` 포트는 Compose 네트워크 내부에서만 사용한다.

프론트엔드의 `NEXT_PUBLIC_API_BASE_URL`이 비어 있으면 브라우저는 같은 출처의 `/api`를 호출하고, Next.js 개발 서버가 `backend:8080`으로 프록시한다. 앱인토스용 정적 번들을 만들 때는 공개 HTTPS 백엔드 주소를 이 변수에 설정한다.

상태 확인:

```bash
docker compose ps

```

종료:

```bash
docker compose down
```

## 앱인토스 번들

앱인토스 비게임 출시 가이드는 SSR을 허용하지 않으므로, 앱인토스용 빌드는 정적 CSR export 경로를 사용한다.

```bash
cd frontend
NEXT_PUBLIC_API_BASE_URL=https://<public-api-host> npm run build:ait
```

결과물은 `frontend/out`에 생성된다. 앱인토스 공식 기존 웹 프로젝트 가이드는 Vite 기반 `@apps-in-toss/web-framework` 설정을 예시로 안내하고 있으며, 현재 Next.js export 결과물을 앱 번들로 등록하는 호환성은 콘솔에서 실제 번들 업로드로 확인해야 한다. 이 확인 전에는 Next.js 지원을 확정하지 않는다.

## 프론트엔드

- Next.js 16.1.1
- React 19.2.0
- TypeScript 5.9.3
- Node.js 24 LTS 컨테이너

Next.js가 화면 구성과 라우팅을 담당하고, React로 입력 폼·결과 화면·확률 애니메이션을 구현한다.

## 백엔드

- Java 25 LTS
- Spring Boot 4.0.0
- Spring Web 기반 REST API
- Gradle 9.1.0

백엔드는 회의 입력값을 받아 탈출 확률과 결과 데이터를 계산하는 무상태 API로 구성한다. 초기 MVP에서는 로그인과 데이터 저장이 없으므로 데이터베이스를 사용하지 않는다.

## 통신

- 프론트엔드와 백엔드 간 REST/JSON 통신
- 프론트엔드 개발 주소: `http://localhost:10000`
- 백엔드 개발 주소: 컨테이너 내부 `http://backend:8080`
- 브라우저에서 호출하는 API 주소: 프론트엔드와 같은 출처의 `/api`
- Next.js가 `/api/*` 요청을 백엔드 컨테이너의 `http://backend:8080/api/*`로 프록시

## Docker Compose

Compose는 다음 두 서비스를 실행한다.

| 서비스 | 역할 | 포트 |
| --- | --- | --- |
| `frontend` | Next.js 개발 서버 | `10000` |
| `backend` | Spring Boot API 서버 | `8080` |

```text
브라우저
  ↓ http://localhost:10000
Next.js 컨테이너
  ↓ /api/analyze → http://backend:8080/api/analyze
Spring Boot 컨테이너
```

### 분석 API

`POST /api/analyze`

요청:

```json
{
  "duration": "sixty",
  "mood": "silent",
  "oneMore": "once",
  "attendees": "manager",
  "hasEndTime": false
}
```

응답:

```json
{
  "probability": 40,
  "statusTitle": "😐 탈출 가능성 있음",
  "statusMessage": "누군가 먼저 ‘저는 이만...’을 말해주길 기다리세요.",
  "estimatedMinutes": 64,
  "meetingType": "🌀 무한 회의",
  "strategies": [
    {
      "name": "화장실 전략",
      "probability": 61,
      "note": "가장 자연스럽게 자리를 비울 수 있습니다."
    }
  ]
}
```

헬스 체크: `GET /api/health`

실행 명령:

```bash
docker compose up --build
```

백그라운드 실행:

```bash
docker compose up --build -d
```

종료:

```bash
docker compose down
```

## 호스트 설치 금지 항목

다음 도구는 로컬에 직접 설치하지 않는다.

- Java
- Node.js
- npm 또는 pnpm
- Gradle

각 도구의 버전은 해당 Dockerfile과 프로젝트의 버전 고정 파일에서 관리한다.

## MVP 운영 원칙

- 데이터베이스 없음
- 로그인 및 회원가입 없음
- 외부 AI/API 없음
- 백엔드는 분석 API 한 개를 중심으로 최소 구성
- 프론트엔드와 백엔드 모두 컨테이너 내부에서 실행
