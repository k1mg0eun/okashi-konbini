import chimeUrl from "./assets/sounds/chime.mp3";
import bgmUrl from "./assets/sounds/bgm.mp3";
import crunchUrl from "./assets/sounds/crunch.mp3";
import stickGrabUrl from "./assets/sounds/stick-grab.wav";   // 감자 게임: 컵에서 스틱을 잡을 때
import stickPlaceUrl from "./assets/sounds/stick-place.wav"; // 감자 게임: 접시에 층을 놓을 때
import stickToppleUrl from "./assets/sounds/stick-topple.wav"; // 감자 게임: 탑이 무너질 때
import tickUrl from "./assets/sounds/tick.wav";                // 모든 버튼: 누를 때 "띡"
import rightUrl from "./assets/sounds/right.wav";              // 동물 과자: 정답 "띵동"
import wrongUrl from "./assets/sounds/wrong.wav";              // 동물 과자: 오답 "부-"
import drinkUrl from "./assets/sounds/drink.wav";              // 음료 냉장고: 음료 마실 때 (뽁·치익·꿀꺽)
import restockUrl from "./assets/sounds/restock.wav";          // 음료 냉장고: 새 음료가 채워질 때 (스르륵·챙)
import fridgeUrl from "./assets/sounds/fridge.wav";            // 음료 냉장고: 유리문 여닫을 때 (드르륵)
import clearUrl from "./assets/sounds/clear.wav";
import capCatchUrl from "./assets/sounds/mushroom-catch.wav";   // 버섯 갓 받기: 갓이 줄기에 끼워질 때 "톡·띵"
import capMissUrl from "./assets/sounds/mushroom-miss.wav";     // 버섯 갓 받기: 갓이 땅에 떨어져 바스러질 때 "툭·바삭"              // 클리어 축하 멜로디 (감자 20층 완성, 동물 과자 전부 맞히기)

// BGM은 앱 전체에서 하나만 존재해야 하므로 모듈 레벨에 둔다.
// (컴포넌트 안에서 만들면 리렌더링·씬 전환마다 새로 생길 수 있음)
const bgm = new Audio(bgmUrl);
bgm.loop = true;
bgm.volume = 0.3;

export function playChimeThenBgm() {
  const chime = new Audio(chimeUrl);
  chime.volume = 0.7;
  chime.play();
  chime.addEventListener("ended", () => bgm.play());
}

export function playCrunch() {
  // 매번 새 Audio를 만들어야 연타했을 때 소리가 겹쳐 재생된다
  const a = new Audio(crunchUrl);
  a.volume = 1.0;
  a.play();
}

// 감자 스틱 게임 전용 효과음 — 같은 파일명으로 덮어쓰면 소리만 바뀐다
function playOnce(url, volume) {
  const a = new Audio(url);
  a.volume = volume;
  a.play();
}
export function playStickGrab() { playOnce(stickGrabUrl, 0.8); }
export function playStickPlace() { playOnce(stickPlaceUrl, 0.9); }
export function playStickTopple() { playOnce(stickToppleUrl, 0.9); }
export function playClear() { playOnce(clearUrl, 0.7); }
export function playTick() { playOnce(tickUrl, 0.7); }
export function playRight() { playOnce(rightUrl, 0.7); }
export function playWrong() { playOnce(wrongUrl, 0.6); }
export function playDrink() { playOnce(drinkUrl, 0.3); }
export function playRestock() { playOnce(restockUrl, 0.7); }
export function playFridge() { playOnce(fridgeUrl, 0.6); }
export function playCapCatch() { playOnce(capCatchUrl, 0.7); }
export function playCapMiss() { playOnce(capMissUrl, 0.6); }

// 상자 위 고양이: 클릭하면 "야옹". src/assets/sounds/meow.mp3 (또는 .wav) 를 넣으면 자동으로 붙고, 없으면 조용히 넘어간다
const meowFiles = import.meta.glob("./assets/sounds/meow.{mp3,wav,m4a,ogg}", { eager: true, query: "?url", import: "default" });
const meowUrl = Object.values(meowFiles)[0];
export function playMeow() { if (meowUrl) playOnce(meowUrl, 0.6); }
