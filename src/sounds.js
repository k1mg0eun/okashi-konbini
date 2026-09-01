import chimeUrl from "./assets/sounds/chime.mp3";
import bgmUrl from "./assets/sounds/bgm.mp3";
import crunchUrl from "./assets/sounds/crunch.mp3";

// BGM은 앱 전체에서 하나만 존재해야 하므로 모듈 레벨에 둔다.
// (컴포넌트 안에서 만들면 리렌더링·씬 전환마다 새로 생길 수 있음)
const bgm = new Audio(bgmUrl);
bgm.loop = true;
bgm.volume = 0.35;

export function playChimeThenBgm() {
  const chime = new Audio(chimeUrl);
  chime.volume = 0.6;
  chime.play();
  chime.addEventListener("ended", () => bgm.play());
}

export function playCrunch() {
  // 매번 새 Audio를 만들어야 연타했을 때 소리가 겹쳐 재생된다
  const a = new Audio(crunchUrl);
  a.volume = 0.9;
  a.play();
}
