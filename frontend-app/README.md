# 회의 탈출 확률 앱

`frontend-app`은 기존 `frontend` 웹 버전과 분리된 Apps-in-Toss Web Framework 앱입니다. 웹 버전의 Next.js 설정과 소스는 변경하지 않습니다.

## 구성

- 번들러: Vite + React + TypeScript
- Apps-in-Toss SDK: Web Framework 3.x
- 설정: `apps-in-toss.config.ts`
- 번들 출력: 프로젝트 루트의 `escape-meeting.ait`
- 권한: 없음

## 환경변수

`.env.example`을 복사해 `VITE_API_BASE_URL`에 공개 HTTPS API origin을 입력합니다.

```text
VITE_API_BASE_URL=https://api.example.com
```

값을 비워두면 현재 origin의 `/api/analyze`를 호출합니다. Apps-in-Toss 콘솔 QR 테스트와 실제 서비스에서는 반드시 공개 HTTPS 백엔드를 사용해야 합니다.

## 스크립트

- `dev`: Vite 개발 서버와 AIT Devtools 실행
- `typecheck`: TypeScript 검사
- `build`: Vite 정적 번들 생성 후 `.ait` 패키지 생성

실제 실행은 저장소의 Node.js 및 패키지 매니저 정책에 맞는 개발 환경에서 진행합니다. 이 저장소에는 의존성 설치 결과물과 lockfile을 커밋하지 않습니다.

## Docker로 로컬 테스트

Docker Desktop이 실행 중인 상태에서 저장소 루트에서 앱과 API를 시작합니다.

```bash
docker compose up --build backend frontend-app
```

브라우저에서 `http://localhost:10001`을 엽니다. 앱인토스 앱은 `10001` 포트, 기존 Next.js 웹 버전은 기존처럼 `10000` 포트에서 확인합니다. 종료할 때는 다음을 실행합니다.

```bash
docker compose down
```

이 경로는 브라우저에서 기능을 확인하는 로컬 테스트입니다. 실제 Toss WebView 테스트는 공개 HTTPS API와 앱인토스 콘솔의 개발 앱 QR 또는 시뮬레이터가 필요합니다.

## 백엔드 CORS

백엔드의 `APP_ALLOWED_ORIGINS`에 쉼표로 구분한 origin을 입력합니다.

```text
APP_ALLOWED_ORIGINS=https://escape-meeting.web.tossmini.com,https://escape-meeting.private-web.tossmini.com
```

로컬 개발 기본값은 `*`입니다. 공개 운영 환경에서는 위 두 Apps-in-Toss origin처럼 실제 허용 origin을 명시합니다.

## 출품 정보 초안

- 한 줄 소개: 회의 중인 상황을 입력하면 탈출 가능성과 전략을 보여주는 회의 생존 시뮬레이터
- 설명: 회의 시간, 분위기, 참석자, 마지막으로 하나만 더가 나온 횟수를 입력하면 근거 없는 알고리즘으로 회의 탈출 확률을 계산합니다. 결과와 탈출 전략을 친구에게 공유할 수 있습니다.
- 아이콘: `public/icon.svg` 초안. 콘솔 등록 전 대표 이미지와 함께 최종 검수합니다.
