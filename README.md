# おかしコンビニ · 과자 편의점
일본 편의점 과자 코너를 컨셉으로 과자마다 다른 미니 게임을 즐기는 인터랙티브 웹사이트

**플레이:** https://k1mg0eun.github.io/okashi-konbini/

## 구성

| 장면 | 내용 |
| --- | --- |
| 입구 | 편의점 외관 |
| 선반 | 과자 3종과 음료 냉장고  |
| 감자 스틱 | 컵 속 감자 과자를 드래그해 접시 위에 쌓는 게임 |
| 버섯 초콜릿 | 언덕에 돋아난 버섯의 갓을 떼어 먹는 게임 |
| 동물 비스킷 | 비스킷 모양을 보고 어떤 동물인지 맞히는 게임 |

## 실행

```bash
npm install
npm run dev       # 개발 서버
npm run build     # dist 에 빌드
npm run preview   # 빌드 결과 미리보기
```

## 주소 파라미터

| 파라미터 | 효과 |
| --- | --- |
| `?scene=shelf` | 입구를 건너뛰고 해당 장면으로 바로 진입 (`potato`, `mushroom`, `animals`) |
| `?scene=potato&tower=5` | 감자 스틱 탑이 5층 쌓인 상태로 시작 |
| `?fridge=open` | 음료 냉장고가 열린 상태로 시작 |

## 구조

```
src/
  main.jsx            진입점
  snack-corner.jsx    모든 장면과 게임 (한 파일)
  sounds.js           효과음·배경 음악 재생 함수
  assets/             과자·접시·스틱 이미지
  assets/sounds/      효과음 파일
```

