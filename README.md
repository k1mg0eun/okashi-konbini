# おかしコンビニ · 과자 편의점

일본 편의점 과자 코너를 돌아다니며 미니 게임을 즐기는 웹 장난감입니다. 자동문을 열고 들어가 선반에서 과자를 고르면 과자마다 다른 게임이 열립니다. React + Vite로 만들었고 데스크톱과 모바일(터치) 모두 지원합니다.

**플레이:** https://k1mg0eun.github.io/okashi-konbini/

## 구성

| 장면 | 내용 |
| --- | --- |
| 입구 | 자동문을 누르면 차임벨과 함께 배경 음악이 시작됩니다. |
| 선반 | 과자 3종과 음료 냉장고. 냉장고는 유리문을 열고 음료를 집을 수 있고, 한 줄을 다 비우면 새 음료가 채워집니다. |
| 감자 스틱 | 컵에서 스틱을 잡아 접시 위로 끌어다 놓는 탑 쌓기. 놓은 가로 위치가 그 층의 위치가 되고, 위쪽 무게중심이 아래 층의 지지 폭을 벗어나면 무너집니다. 위태로울수록 탑이 기울며 경고합니다. 20층을 쌓으면 완성입니다. |
| 버섯 초콜릿 | 언덕에 돋아난 버섯의 갓을 떼어 먹는 놀이. 마우스를 움직이면 낮과 밤이 바뀝니다. |
| 동물 비스킷 | 비스킷 모양을 보고 어떤 동물인지 맞히는 퀴즈. 여섯 마리를 모두 맞히면 완성입니다. |

## 실행

```bash
npm install
npm run dev       # 개발 서버
npm run build     # dist 에 빌드
npm run preview   # 빌드 결과 미리보기
```

개발할 때 쓸 수 있는 주소 파라미터가 있습니다.

| 파라미터 | 효과 |
| --- | --- |
| `?scene=shelf` | 입구를 건너뛰고 해당 장면으로 바로 진입 (`potato`, `mushroom`, `animals`) |
| `?scene=potato&tower=5` | 감자 스틱 탑이 5층 쌓인 상태로 시작 |
| `?fridge=open` | 음료 냉장고가 열린 상태로 시작 |

## 배포

`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해서 GitHub Pages에 올립니다. 저장소 설정의 Pages → Source가 **GitHub Actions**로 되어 있어야 합니다. 하위 경로에 배포되므로 `vite.config.js`의 `base`가 저장소 이름과 같아야 합니다.

## 구조

```
src/
  main.jsx            진입점
  snack-corner.jsx    모든 장면과 게임 (한 파일)
  sounds.js           효과음·배경 음악 재생 함수
  assets/             과자·접시·스틱 이미지
  assets/sounds/      효과음 파일
```

## 효과음

배경 음악, 차임벨, 크런치를 제외한 효과음은 파이썬으로 파형을 계산해 합성한 WAV입니다. 같은 이름으로 `src/assets/sounds/`에 덮어쓰면 소리만 바뀝니다.

| 파일 | 쓰임 |
| --- | --- |
| `tick.wav` | 모든 버튼 클릭. 자기 소리가 있는 요소는 `data-silent` 속성으로 제외 |
| `stick-grab.wav` / `stick-place.wav` / `stick-topple.wav` | 감자 스틱 잡기 / 놓기 / 무너짐 |
| `right.wav` / `wrong.wav` | 동물 비스킷 정답 / 오답 |
| `clear.wav` | 감자 20층 완성, 동물 전부 정답 |
| `fridge.wav` / `drink.wav` / `restock.wav` | 냉장고 문 / 음료 집기 / 재입고 |

음량은 `sounds.js`의 각 재생 함수에서 조절합니다.
