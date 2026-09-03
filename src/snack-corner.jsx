import { useState, useEffect, useRef, useMemo } from "react";
import { playChimeThenBgm, playCrunch, playStickGrab, playStickPlace, playStickTopple, playClear, playTick, playRight, playWrong, playDrink, playRestock, playFridge, playMeow, playCapCatch, playCapMiss } from "./sounds.js";
import CUP_IMG from "./assets/cup.png";
import CUP_OPEN_IMG from "./assets/cup-open.png";
import CUP_REAL_IMG from "./assets/cup-real.png"; // 실제 컵 사진 (살짝 위에서, 배경 투명)
import STICK_IMG from "./assets/stick.png";       // 스틱 한 개 (140×800, 배경 투명)
import PLATE_IMG from "./assets/plate.png";       // 접시 (1028×397, 배경 투명)
import MUSH_IMG from "./assets/mushroom.png";
import MUSH_OPEN_IMG from "./assets/mushroom-open.png";
import ANIM_IMG from "./assets/animals.png";
import ANIM_OPEN_IMG from "./assets/animals-open.png";
import BIS_ELEPHANT from "./assets/animals/elephant.png";
import BIS_RABBIT from "./assets/animals/rabbit.png";
import BIS_DUCK from "./assets/animals/duck.png";
import BIS_CAT from "./assets/animals/cat.png";
import BIS_FISH from "./assets/animals/fish.png";
import BIS_TURTLE from "./assets/animals/turtle.png";

// ── shared tokens ────────────────────────────────────────────
const F = {
  disp: "'Mochiy Pop One', sans-serif",
  body: "'Zen Maru Gothic', ui-rounded, system-ui, sans-serif",
};
const rand = (a, b) => a + Math.random() * (b - a);
function useMedia(q) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const f = () => setM(mq.matches); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); }, [q]);
  return m;
}
function useSize(ref) {
  const [sz, setSz] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setSz({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return sz;
}
const FM = { green: "#00A040", blue: "#0068B7", ink: "#1F2A33", wall: "#F1F4F2", shelf: "#FFFFFF" };

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Zen+Maru+Gothic:wght@500;700&family=Noto+Sans+JP:wght@700;900&display=swap');
  @keyframes rise { from { transform: translateY(70px) } to { transform: translateY(0) } }
  @keyframes fly { 0% { transform: translate(0,0) rotate(0deg) } 45% { transform: translate(var(--dx), -220px) rotate(80deg) } 100% { transform: translate(var(--dx), var(--dy)) rotate(90deg) } }
  @keyframes wobble { 0%,100% { transform: rotate(calc(var(--amp) * -1deg)) } 50% { transform: rotate(calc(var(--amp) * 1deg)) } }
  @keyframes rattle { 0%,100% { transform: translateX(0) rotate(0) } 25% { transform: translateX(-4px) rotate(-2deg) } 75% { transform: translateX(4px) rotate(2deg) } }
  @keyframes pop { 0% { opacity:1; transform: translate(0,0) rotate(0) scale(var(--s)) } 100% { opacity:0; transform: translate(var(--x), var(--y)) rotate(var(--r)) scale(var(--s)) } }
  @keyframes tumble { to { transform: translate(var(--x), var(--y)) rotate(var(--r)); opacity: .92 } }
  @keyframes placePop { 0% { transform: translateY(-9px) scaleY(.6) } 60% { transform: translateY(0) scaleY(1.12) } 100% { transform: translateY(0) scaleY(1) } }
  @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
  @keyframes sprout { 0% { transform: scaleY(0) } 70% { transform: scaleY(1.1) } 100% { transform: scaleY(1) } }
  @keyframes capDrop { 0% { transform: translate(0,0) rotate(0) } 100% { transform: translate(var(--x), 160px) rotate(var(--r)); opacity: 0 } }
  @keyframes wiggle { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }
  @keyframes drinkPick { 0% { transform: translateY(0) scale(1); opacity: 1 } 100% { transform: translateY(-16px) scale(1.06); opacity: 0 } }
  .drinkSlot { flex-shrink: 0; transition: width .35s cubic-bezier(.4,0,.2,1), margin-right .35s cubic-bezier(.4,0,.2,1), transform .15s ease; }
  .drinkSlot.canPick { cursor: pointer; }
  .drinkSlot.canPick:hover { transform: translateY(-3px); }
  .drinkSlot.picking { animation: drinkPick .28s ease-out both; pointer-events: none; }
  .drinkSlot.taken { width: 0 !important; margin-right: 0 !important; visibility: hidden; pointer-events: none; }
  @keyframes drinkRestock { 0% { transform: translateX(36px) scale(.9); opacity: 0 } 100% { transform: none; opacity: 1 } }
  .drinkSlot.restock { animation: drinkRestock .45s cubic-bezier(.2,.8,.3,1) backwards; }
  @keyframes shakeX { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-8px) } 60% { transform: translateX(8px) } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
  @keyframes lidOpen { to { transform: rotateX(-110deg) } }
  @keyframes openPop { 0% { transform: translateX(-50%) scale(.96) } 60% { transform: translateX(-50%) scale(1.02) } 100% { transform: translateX(-50%) scale(1) } }
  @keyframes openPopL { 0% { transform: scale(.96) } 60% { transform: scale(1.02) } 100% { transform: scale(1) } }
  @keyframes swing { 0%,100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }
  @keyframes catBreathe { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.035) } }
  @keyframes catZ { 0% { opacity: 0; transform: translate(0, 4px) scale(.8) } 30% { opacity: .9 } 100% { opacity: 0; transform: translate(7px, -16px) scale(1.15) } }
  @keyframes catEar { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-16deg) } 55% { transform: rotate(9deg) } 80% { transform: rotate(-5deg) } }
  @keyframes catTail { 0%,100% { transform: rotate(0) } 30% { transform: rotate(-24deg) } 65% { transform: rotate(12deg) } }
  .cat { cursor: pointer; user-select: none; -webkit-user-select: none; }
  .cat .cat-body { transform-box: fill-box; transform-origin: 50% 100%; animation: catBreathe 3.4s ease-in-out infinite; }
  .cat .cat-z { transform-box: fill-box; transform-origin: 50% 50%; animation: catZ 2.6s ease-out infinite; }
  .cat .cat-z2 { animation-delay: 1.3s; }
  .cat.poke .cat-z { animation: none; opacity: 0; }
  .cat .cat-ear-l, .cat .cat-ear-r, .cat .cat-tail { transform-box: fill-box; }
  .cat .cat-ear-l { transform-origin: 100% 100%; }
  .cat .cat-ear-r { transform-origin: 0% 100%; }
  .cat .cat-tail { transform-origin: 0% 100%; }
  .cat.poke .cat-ear-l { animation: catEar .9s ease; }
  .cat.poke .cat-ear-r { animation: catEar .9s ease .08s; }
  .cat.poke .cat-tail { animation: catTail .9s ease; }
  @keyframes zoomIn { from { transform: scale(1) } to { transform: scale(5); opacity: 0 } }
  @keyframes bisIdle { 0%,100% { transform: rotateX(8deg) rotateY(-14deg) } 50% { transform: rotateX(-6deg) rotateY(14deg) } }
  @keyframes bisBake { 0% { transform: rotateX(0) rotateY(0) } 60% { transform: rotateX(-10deg) rotateY(380deg) scale(1.12) } 100% { transform: rotateX(0) rotateY(360deg) scale(1) } }
  .bis { position: relative; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none; }
  .bis:active { cursor: grabbing; }
  .bisBody { position: absolute; inset: 0; transform-style: preserve-3d; will-change: transform; }
  .bisBody.idle { animation: bisIdle 5s ease-in-out infinite; }
  .bisBody.bake { animation: bisBake .9s cubic-bezier(.3,.8,.3,1) both; }
  .bisLayer { position: absolute; inset: 0; -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; transition: background .5s; }
  .bisFace { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: filter .5s; pointer-events: none; }
  .scene { animation: fadeIn .45s ease-out both; }
  .fridgeDoor { position: absolute; top: 0; bottom: 0; left: 0; width: 100%; transition: transform .85s cubic-bezier(.4,0,.2,1); cursor: pointer; }
  .fridgeDoor:hover .fridgeHandle { background: linear-gradient(90deg, #C9D1CE, #FFFFFF 50%, #C9D1CE); }
  .tierScroll { scrollbar-width: none; -webkit-overflow-scrolling: touch; cursor: grab; }
  .tierScroll:active { cursor: grabbing; }
  .tierScroll::-webkit-scrollbar { display: none; }
  .stickBtn { cursor: grab; transition: transform .18s; display: block; background: none; border: 0; padding: 0; touch-action: none; }
  .stickBtn:active { cursor: grabbing; }
  .stickBtn:hover, .stickBtn:focus-visible { transform: translateY(-22px); outline: none; }
  .stickImg { display: block; pointer-events: none; user-select: none; -webkit-user-drag: none; filter: drop-shadow(0 3px 3px rgba(60,30,0,.25)); }
  .shroom { cursor: pointer; transform-origin: bottom center; transition: transform .2s; }
  .shroom:hover, .shroom:focus-visible { animation: wiggle .5s ease-in-out infinite; outline: none; }
  .boxBtn { cursor: pointer; transition: transform .25s cubic-bezier(.2,.9,.3,1.3); transform-origin: bottom center; background: none; border: 0; padding: 0; font-family: inherit; }
  .boxBtn:hover, .boxBtn:focus-visible { transform: translateY(-16px) rotate(-2deg); outline: none; }
  .btn { border: 0; border-radius: 99px; padding: 10px 18px; font-weight: 700; font-family: inherit; cursor: pointer; }
  .btn:focus-visible { outline: 3px solid #0068B7; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; transition: none !important; } }
`;

// ── generic chrome ───────────────────────────────────────────
function TopBar({ onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px 0", position: "relative", zIndex: 2 }}>
      <button className="btn" onClick={onBack} style={{ background: FM.green, color: "#fff", boxShadow: `0 3px 0 ${FM.blue}`, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
        ← 다른 과자 고르기
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SCENE 1 · SHELF
// ═════════════════════════════════════════════════════════════
function Shelf({ onOpen }) {
  const [opening, setOpening] = useState(null);
  const [lift, setLift] = useState(null); // { ti, x } — tier temporarily un-clipped while its package opens
  const rowRefs = useRef([]);
  const desktop = useMedia("(min-width: 900px)");
  const gondolaRef = useRef(null);
  const { w: gw, h: gh } = useSize(gondolaRef);

  // 마우스 드래그로 선반 밀기 (터치 스크롤은 브라우저가 기본 제공)
  const dragRef = useRef(null);    // 드래그 중인 선반 정보 { el, x, left }
  const draggedRef = useRef(false); // 방금 동작이 드래그였으면 클릭(open)을 무시
  useEffect(() => {
    function move(e) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 5) draggedRef.current = true;
      d.el.scrollLeft = d.left - dx;
    }
    function up() { dragRef.current = null; }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  function open(key, uid, ti) {
    if (draggedRef.current) return;
    playCrunch();
    const el = rowRefs.current[ti];
    if (el) setLift({ ti, x: el.scrollLeft });
    setOpening(uid || key);
    setTimeout(() => onOpen(key), OPEN_IMG[key] ? 1000 : 650);
  }

  // one product per shelf, repeated along the whole rail
  const base = [
    { h: 136, n: 9, span: 3, real: "potato", price: 205, kind: "cup" },
    { h: 128, n: 6, span: 2, real: "mushroom", price: 284, kind: "mbox" },
    { h: 184, n: 6, span: 2, real: "animals", price: 178, kind: "abox" },
  ];
  // 데스크톱: 세로로는 3단이 한 화면에 들어오게 스케일, 가로로는 폭에 맞춰 개수를 채운다
  const RAIL = 12 + 50 + 22;                       // 선반 립 + 가격표 레일 + 하단 그늘 (단당 고정 높이)
  const S = desktop && gh ? Math.min(1.6, Math.max(1, (gh - RAIL * base.length - 24) / base.reduce((a, t) => a + t.h, 0))) : 1;
  const tiers = base.map((t) => {
    const pw = PKG_W[t.kind] * S;
    const inner = gw - 12;                          // 좌우 여백(6px×2) 제외한 선반 가용 폭
    // 데스크톱은 스크롤 없이 폭에 들어가는 개수만 진열한다
    const n = desktop && gw ? Math.max(1, Math.floor((inner + 3) / (pw + 3))) : t.n;
    // 남는 폭은 과자 사이 간격으로 균등 분배 (가격표 레일도 같은 간격을 쓴다)
    const g = desktop && gw && n > 1 ? Math.max(3, Math.min(48, Math.floor((inner - n * pw) / (n - 1)))) : 3;
    return { ...t, h: Math.round(t.h * S), pw, n, g };
  });

  const tierRows = tiers.map((t, ti) => (
    <div key={ti} ref={(el) => (rowRefs.current[ti] = el)} className={desktop ? undefined : "tierScroll"} onMouseDown={desktop ? undefined : (e) => { draggedRef.current = false; dragRef.current = { el: e.currentTarget, x: e.clientX, left: e.currentTarget.scrollLeft }; e.preventDefault(); }} style={{ position: "relative", overflowX: lift?.ti === ti ? "visible" : desktop ? "hidden" : "auto", overflowY: lift?.ti === ti ? "visible" : "hidden", zIndex: lift?.ti === ti ? 20 : 1 }}>
      <div style={{ display: "inline-flex", flexDirection: "column", minWidth: "100%", transform: lift?.ti === ti ? `translateX(${-lift.x}px)` : "none" }}>
        {/* products */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "safe center", gap: t.g, height: t.h, padding: `0 ${desktop ? 6 : Math.max(6, t.g)}px` }}>
          {Array.from({ length: t.n }).map((_, f) => (
            <RealPackage key={f} item={{ kind: t.kind, key: t.real }} h={t.h - 14} scale={S} active={opening === `${ti}-${f}`} onClick={() => open(t.real, `${ti}-${f}`, ti)} />
          ))}
        </div>
        {/* shelf lip + price rail */}
        <div style={{ height: 12, background: "linear-gradient(180deg, #FFFFFF, #E3E8E6)", boxShadow: "0 3px 0 #C5CDCA" }} />
        <div style={{ display: "flex", justifyContent: "safe center", gap: t.g, height: 50, padding: `0 ${desktop ? 6 : Math.max(6, t.g)}px`, background: "#EEF1F0", borderBottom: `5px solid ${FM.green}` }}>
          {(() => {
            const span = t.span || 1;                       // facings per price tag
            const tags = Math.ceil(t.n / span);
            return Array.from({ length: tags }).map((_, g) => {
              const k = Math.min(span, t.n - g * span);    // last tag may cover fewer
              return (
                <div key={g} style={{ width: t.pw * k + t.g * (k - 1), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PriceTag info={REAL[t.real]} price={t.price} />
                </div>
              );
            });
          })()}
        </div>
        <div style={{ height: 22, background: "linear-gradient(180deg, #D3DAD7, #F1F4F2)" }} />
      </div>
    </div>
  ));

  const pegboard = <div style={{ position: "absolute", inset: "0", backgroundImage: "radial-gradient(#D7DEDB 1.4px, transparent 1.8px)", backgroundSize: "18px 18px", zIndex: 0 }} />;

  if (!desktop) {
    return (
      <div className="scene" style={{ minHeight: "100vh", background: FM.wall, position: "relative", overflow: "hidden" }}>
        <Fascia />
        <GlassStrip><InfoPoster /></GlassStrip>
        {pegboard}
        <div style={{ position: "relative", paddingTop: 18 }}>{tierRows}</div>
      </div>
    );
  }

  // ── 데스크톱: 얇은 파사드 + [안내 포스터 컬럼 | 곤돌라 선반] + 바닥 ──
  return (
    <div className="scene" style={{ height: "100vh", background: FM.wall, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Fascia compact />
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "clamp(260px, 23vw, 560px) 1fr clamp(280px, 27vw, 600px)" }}>
        {pegboard}
        {/* ceiling light strip */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 10, background: "linear-gradient(180deg, #FFFFFF, #E9EDEB)", boxShadow: "0 2px 0 #C9D1CE, 0 12px 28px rgba(255,255,255,.9)", zIndex: 1 }} />
        {/* left: glass window with sign + poster */}
        <div style={{ position: "relative", zIndex: 2, padding: "26px 0 0 22px", display: "flex", flexDirection: "column" }}>
          <GlassStrip vertical><InfoPoster vertical /><BoxPile /></GlassStrip>
        </div>
        {/* right: gondola shelf */}
        <div ref={gondolaRef} style={{ position: "relative", zIndex: 2, padding: "22px 18px 0", display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 0 }}>
          {/* end panels (gondola uprights) */}
          <div style={{ position: "absolute", top: 12, bottom: 0, left: 6, width: 12, background: "linear-gradient(90deg, #9AA5A1, #E8EDEB 45%, #B7C0BC)", borderRadius: "3px 3px 0 0", zIndex: 5 }} />
          <div style={{ position: "absolute", top: 12, bottom: 0, right: 6, width: 12, background: "linear-gradient(90deg, #B7C0BC, #E8EDEB 55%, #9AA5A1)", borderRadius: "3px 3px 0 0", zIndex: 5 }} />
          <div style={{ position: "relative" }}>{tierRows}</div>
        </div>
        {/* right: drink fridge */}
        <div style={{ position: "relative", zIndex: 2, padding: "22px 22px 0 6px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <DrinkFridge />
        </div>
      </div>
      {/* floor: kick plate + tiles */}
      <div style={{ position: "relative", zIndex: 3, height: 64, flexShrink: 0, background: "linear-gradient(180deg, #B9C3BF 0 8px, #DDE3E0 8px)", backgroundImage: "linear-gradient(180deg, #B9C3BF 0 8px, transparent 8px), linear-gradient(90deg, rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(180deg, rgba(0,0,0,.06) 1px, transparent 1px)", backgroundSize: "100% 100%, 56px 56px, 56px 56px", boxShadow: "inset 0 10px 14px -8px rgba(0,0,0,.25)" }} />
    </div>
  );
}

// ── 음료 냉장고 (데스크톱) — 유리문 2짝, 클릭하면 경첩 기준으로 열린다. 음료는 임시 CSS 목업 ──
// 한 단 = 한 종류. 실제 음료 이미지가 오면 kind/color 대신 img로 교체하면 된다.
const DRINK_ROWS = [
  { kind: "can", colors: ["#D8232A", "#D8232A", "#D8232A", "#1B5DB8", "#1B5DB8", "#1B5DB8", "#0B7A3B", "#0B7A3B", "#0B7A3B"] , tags: [{ name: "コーラ", sub: "缶 350ml", jan: "4902102072618", price: 140 }, { name: "サイダー", sub: "缶 350ml", jan: "4901340002807", price: 130 }] },
  { kind: "pet", colors: ["#BFE3F5", "#BFE3F5", "#BFE3F5", "#BFE3F5", "#8FD0F0", "#8FD0F0", "#3DBE6C", "#3DBE6C"], tags: [{ name: "お茶", sub: "ペットボトル 500ml", jan: "4901085614310", price: 130 }, { name: "水", sub: "ペットボトル 550ml", jan: "4902102113304", price: 110 }] },
  { kind: "pet", colors: ["#F39A1E", "#F39A1E", "#F39A1E", "#F6C62B", "#F6C62B", "#E8442E", "#E8442E", "#7B4DB5"], tags: [{ name: "オレンジジュース", sub: "ペットボトル 470ml", jan: "4902179009623", price: 150 }, { name: "ぶどうジュース", sub: "ペットボトル 470ml", jan: "4902179009630", price: 150 }] },
  { kind: "milk", colors: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFE9A8", "#FFE9A8", "#D7B48A", "#D7B48A", "#F6C5D6"], tags: [{ name: "牛乳", sub: "紙パック 500ml", jan: "4902720049450", price: 130 }, { name: "コーヒー", sub: "紙パック 240ml", jan: "4902720049467", price: 120 }] },
];

// 색상 목록을 슬롯 수에 맞춰 고르게 배분 — 같은 색끼리 묶은 뒤, 앞 그룹부터 하나씩 더 받는 식으로 n개를 채운다
// (슬롯이 줄어도 뒤쪽 색이 통째로 사라지지 않게)
function spreadColors(colors, n) {
  const groups = colors.filter((c, i) => i === 0 || c !== colors[i - 1]);
  const G = groups.length, base = Math.floor(n / G), extra = n % G;
  return groups.flatMap((c, g) => Array(base + (g < extra ? 1 : 0)).fill(c));
}

function Drink({ kind, color, h }) {
  const w = kind === "can" ? h * .52 : h * .36;
  const label = <div style={{ position: "absolute", left: "12%", right: "12%", top: kind === "can" ? "34%" : "48%", height: "26%", background: "rgba(255,255,255,.85)", borderRadius: 2, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }} />;
  const shine = <div style={{ position: "absolute", left: "14%", top: "6%", bottom: "6%", width: "14%", borderRadius: 99, background: "rgba(255,255,255,.45)" }} />;
  if (kind === "can") return (
    <div style={{ position: "relative", width: w, height: h, flexShrink: 0, borderRadius: "6px 6px 5px 5px", background: `linear-gradient(90deg, ${color}, ${color} 60%, rgba(0,0,0,.18))`, boxShadow: "inset 0 -3px 0 rgba(0,0,0,.25), 0 2px 3px rgba(0,0,0,.2)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "8%", borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg, #F2F5F4, #AAB3B0)" }} />
      {shine}{label}
    </div>
  );
  // PET / 우유병: 캡 + 목 + 몸통
  const cap = kind === "milk" ? "#2F6FB8" : (color === "#BFE3F5" || color === "#8FD0F0" ? "#4CA9E6" : color);
  return (
    <div style={{ position: "relative", width: w, height: h, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "46%", height: "9%", background: cap, borderRadius: "3px 3px 1px 1px", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.25)" }} />
      <div style={{ width: "58%", height: "10%", background: kind === "milk" ? color : `color-mix(in srgb, ${color} 60%, #fff)`, borderRadius: "40% 40% 0 0 / 100% 100% 0 0" }} />
      <div style={{ position: "relative", width: "100%", flex: 1, borderRadius: kind === "milk" ? "4px 4px 5px 5px" : "5px 5px 6px 6px", background: `linear-gradient(90deg, ${color}, ${color} 62%, rgba(0,0,0,.14))`, boxShadow: "inset 0 -3px 0 rgba(0,0,0,.18), 0 2px 3px rgba(0,0,0,.2)" }}>
        {shine}{label}
      </div>
    </div>
  );
}

function DrinkFridge() {
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).get("fridge") === "open"); // ?fridge=open 으로 열린 상태 확인 (개발용)
  const innerRef = useRef(null);
  const { w: iw, h: ih } = useSize(innerRef);
  const rowH = ih ? ih / DRINK_ROWS.length : 150;
  const anyOpen = open;
  // 음료 집기: key(`row-idx`) → "picking"(튀어오름) → "taken"(폭이 0으로 줄며 옆 병들이 밀려와 채움)
  const [picked, setPicked] = useState({});
  const pick = (key) => (e) => {
    e.stopPropagation();
    if (!anyOpen || picked[key]) return;
    playDrink();
    setPicked((m) => ({ ...m, [key]: "picking" }));
    setTimeout(() => setPicked((m) => ({ ...m, [key]: "taken" })), 280);
  };
  // 재입고: 한 줄을 다 비우면 잠시 뒤 새 음료가 뒤에서 밀려 들어와 채움
  const nRef = useRef([]);
  const [restock, setRestock] = useState({});           // row → tick (키를 바꿔 슬라이드 인 애니메이션 재생)
  useEffect(() => {
    const timers = [];
    DRINK_ROWS.forEach((_, i) => {
      const n = nRef.current[i];
      if (!n) return;
      const taken = Object.entries(picked).filter(([k, v]) => k.startsWith(`${i}-`) && v === "taken").length;
      if (taken < n) return;
      timers.push(setTimeout(() => {
        setPicked((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !k.startsWith(`${i}-`))));
        setRestock((r) => ({ ...r, [i]: (r[i] || 0) + 1 }));
        playRestock();
      }, 1200));
    });
    return () => timers.forEach(clearTimeout);
  }, [picked]);

  const rows = DRINK_ROWS.map((r, i) => {
    const avail = rowH - 42;                                   // 선반 8 + 가격 레일 34
    const h = Math.round(avail * (r.kind === "can" ? .62 : .86));
    const w = r.kind === "can" ? h * .52 : h * .36;
    const gap = 3;
    const n = iw ? Math.max(4, Math.floor((iw - 16) / (w + gap)) - 1) : 7; // 꽉 채울 수 있는 개수보다 하나 적게 (너무 꽉 차 보이지 않도록)
    nRef.current[i] = n;
    const tick = restock[i] || 0;
    const slotColors = spreadColors(r.colors, n);
    return (
      <div key={i} style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 8px", overflow: "hidden" }}>
          {Array.from({ length: n }).map((_, k) => {
            const key = `${i}-${k}`, st = picked[key];
            return (
              <div key={`${k}-${tick}`} className={`drinkSlot${st ? " " + st : anyOpen ? " canPick" : ""}${tick && !st ? " restock" : ""}`} onClick={pick(key)} style={{ width: w, marginRight: gap, animationDelay: tick ? `${k * 45}ms` : undefined }}>
                <Drink kind={r.kind} color={slotColors[k]} h={h} />
              </div>
            );
          })}
        </div>
        {/* 선반 + LED 라인 */}
        <div style={{ height: 8, background: "linear-gradient(180deg, #F4F8FA, #C9D3D8)", boxShadow: "0 2px 0 #9FB0B8, 0 -6px 12px rgba(255,255,255,.9)" }} />
        {/* 가격 레일 — 곤돌라와 같은 방식, 카드 2장을 좌우로 벌려 배치 */}
        <div style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "space-evenly", padding: "0 8px", background: "#E9F0F3", borderBottom: "2px solid #B9C7CE", overflow: "hidden" }}>
          {r.tags.map((t, g) => (
            <PriceTag key={g} info={{ name: t.name, sub: t.sub, jan: t.jan }} price={t.price} scale={.72} />
          ))}
        </div>
      </div>
    );
  });

  // 슬라이드 유리문 1짝 — 왼쪽 손잡이를 잡고 오른쪽으로 밀어 넣는 방식
  const door = (() => {
    const isOpen = open;
    return (
      <div className="fridgeDoor" role="button" data-silent aria-label={isOpen ? "냉장고 문 닫기" : "냉장고 문 열기"} onClick={() => { playFridge(); setOpen((o) => !o); }}
        style={{ transform: isOpen ? "translateX(86%)" : "none", zIndex: 5 }}>
        {/* 유리 + 프레임 */}
        <div style={{ position: "absolute", inset: 0, border: "7px solid #C0C9CE", borderColor: "#D9E0E3 #A3AEB4 #A3AEB4 #D9E0E3", background: isOpen ? "linear-gradient(115deg, rgba(255,255,255,.14) 0 18%, rgba(220,235,242,.08) 18% 42%, rgba(255,255,255,.06) 42% 55%, rgba(200,222,232,.1) 55%)" : "linear-gradient(115deg, rgba(255,255,255,.28) 0 18%, rgba(220,235,242,.16) 18% 42%, rgba(255,255,255,.12) 42% 55%, rgba(200,222,232,.18) 55%)", boxShadow: isOpen ? "-10px 0 24px rgba(0,0,0,.22), inset 0 0 0 2px rgba(255,255,255,.6)" : "inset 0 0 0 2px rgba(255,255,255,.6)" }}>
          {/* 손잡이 */}
          <div className="fridgeHandle" style={{ position: "absolute", top: "30%", bottom: "30%", left: 10, width: 10, borderRadius: 5, background: "linear-gradient(90deg, #8F9A96, #E8EDEB 50%, #8F9A96)", boxShadow: "0 2px 4px rgba(0,0,0,.35)" }} />
          {/* つめた〜い 스티커 */}
          <div style={{ position: "absolute", top: 14, left: 30, padding: "5px 9px", background: "#1B5DB8", color: "#fff", borderRadius: 99, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: ".06em", boxShadow: "0 2px 0 rgba(0,0,0,.2)", transform: "rotate(-4deg)" }}>❄ つめた〜い</div>
          <div style={{ position: "absolute", top: 14, right: 14, width: 64, padding: "5px 0", background: A.yellow, color: "#D0021B", border: `2px solid ${A.pinkDeep}`, borderRadius: 3, textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: 11, transform: "rotate(3deg)", boxShadow: "0 2px 0 rgba(0,0,0,.15)" }}>2本で<br />¥200</div>
        </div>
      </div>
    );
  })();

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg, #D5DDE1, #B9C3C8)", boxShadow: "0 0 0 2px #9EA9AF, 0 10px 24px rgba(0,0,0,.18)", position: "relative" }}>
      {/* 상단 간판 */}
      <div style={{ height: 46, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "linear-gradient(180deg, #C6CFD4, #ADB8BE)", borderBottom: "2px solid #939EA4", borderRadius: "6px 6px 0 0", color: "#fff", textShadow: "0 1px 0 rgba(0,0,0,.15)", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900 }}>
        <span style={{ fontSize: 18, letterSpacing: ".18em", whiteSpace: "nowrap" }}>ドリンク</span>
        {iw >= 340 && <span style={{ fontSize: 10, letterSpacing: ".24em", color: "#E6F5EE", whiteSpace: "nowrap" }}>COLD DRINKS</span>}
      </div>
      {/* 본체: 내부 + 유리문 */}
      <div style={{ position: "relative", flex: 1, minHeight: 0, margin: "0 8px", overflow: "hidden" }}>
        <div ref={innerRef} onClick={() => { if (anyOpen) { playFridge(); setOpen(false); } }} style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #F3FAFF, #DCEBF4)", boxShadow: "inset 0 0 40px rgba(120,170,200,.35)", display: "flex", flexDirection: "column", overflow: "hidden", cursor: anyOpen ? "pointer" : "default" }}>
          {/* 내부 LED 천장 */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: "#fff", boxShadow: "0 0 24px 10px rgba(255,255,255,.95)", zIndex: 2 }} />
          {rows}
        </div>
        {door}
      </div>
      {/* 하단 그릴 */}
      <div style={{ height: 40, flexShrink: 0, margin: "0 8px", background: "repeating-linear-gradient(180deg, #C6CFD4 0 4px, #A3AEB4 4px 8px)", borderTop: "4px solid #B9C3C8" }} />
    </div>
  );
}

// ── store fascia + info poster (original signage, brand colors only) ──
function Fascia({ compact }) {
  return (
    <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
      {/* eave */}
      <div style={{ height: 8, background: "linear-gradient(180deg, #CFD6D3, #B7C0BC)" }} />
      {/* fascia band */}
      <div style={{ background: FM.green, padding: compact ? "12px 22px 0" : "14px 16px 0", position: "relative" }}>
        <div style={{ maxWidth: compact ? "none" : 560, width: compact ? "fit-content" : "auto", margin: compact ? 0 : "0 auto", background: "#fff", borderRadius: 4, padding: compact ? "16px 24px 14px" : "10px 18px 8px", textAlign: compact ? "left" : "center", boxShadow: "0 2px 0 rgba(0,0,0,.15)", display: compact ? "flex" : "block", alignItems: "baseline", gap: 14 }}>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: compact ? 28 : "clamp(20px, 4.5vw, 30px)", color: FM.blue, letterSpacing: "-.01em", lineHeight: 1 }}>おかしコンビニ</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: FM.green, letterSpacing: ".22em", marginTop: compact ? 0 : 4 }}>과자 편의점 · OKASHI KONBINI · 24H</div>
        </div>
        {/* stripes */}
        <div style={{ marginTop: compact ? 8 : 12, height: 6, background: "#fff" }} />
        <div style={{ height: 6, background: FM.blue }} />
      </div>
    </div>
  );
}

// 유리창 띠 — 모바일은 가로 띠, 데스크톱은 선반 옆 세로 창
function GlassStrip({ vertical, children }) {
  return (
    <div style={{ background: "linear-gradient(180deg, #E4EEF3, #CFDEE6)", borderBottom: vertical ? "none" : "6px solid #9EAAB0", border: vertical ? "6px solid #9EAAB0" : undefined, borderBottomWidth: vertical ? 0 : 6, borderRadius: vertical ? "6px 6px 0 0" : 0, padding: vertical ? "18px 14px 20px" : "12px 16px 14px", position: "relative", overflow: "hidden", zIndex: 2, flex: vertical ? 1 : "none", display: vertical ? "flex" : "block", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg, transparent 0 140px, rgba(255,255,255,.35) 140px 170px)", pointerEvents: "none" }} />
      {children}
    </div>
  );
}

function InfoPoster({ vertical }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: vertical ? "column" : "row", gap: vertical ? 40 : 10, alignItems: vertical ? "center" : "stretch", position: "relative", width: "100%" }}>
      {/* hanging door sign */}
      <div style={{ flexShrink: 0, alignSelf: vertical ? "center" : "flex-start", width: 62, display: "flex", flexDirection: "column", alignItems: "center", marginTop: vertical ? -18 : -12, transformOrigin: "top center", animation: "swing 3.2s ease-in-out infinite" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#B7C0BC", boxShadow: "inset 0 -2px 0 #8F9A96" }} />
        <div style={{ width: 2, height: 14, background: "#8F9A96" }} />
        <div style={{ width: 62, background: "#fff", border: "2px solid " + FM.ink, borderRadius: 6, padding: "6px 0 5px", textAlign: "center", boxShadow: "0 2px 0 rgba(0,0,0,.2)", fontFamily: "'Noto Sans JP', sans-serif" }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: FM.green, lineHeight: 1 }}>営業中</div>
          <div style={{ fontWeight: 900, fontSize: 8, color: FM.blue, letterSpacing: ".08em", marginTop: 3 }}>24時間</div>
        </div>
      </div>
      {/* poster taped to the glass */}
      <div style={{ flex: vertical ? "none" : 1, width: vertical ? "100%" : "auto", maxWidth: vertical ? 270 : "none", background: "#fff", borderRadius: 4, padding: vertical ? "11px 13px 12px" : "10px 14px 12px", boxShadow: "0 3px 8px rgba(0,0,0,.12)", position: "relative", fontFamily: "'Noto Sans JP', 'Zen Maru Gothic', sans-serif", color: FM.ink, transform: vertical ? "rotate(-1.2deg)" : "none" }}>
        <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 46, height: 12, background: "rgba(255,255,255,.7)", border: "1px solid rgba(0,0,0,.08)" }} />
        <div style={{ display: "inline-block", background: FM.green, color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 2, letterSpacing: ".1em" }}>あそびかた · 이용 안내</div>
        <div style={{ fontWeight: 900, fontSize: vertical ? 16 : "clamp(14px, 3.4vw, 18px)", marginTop: 8, lineHeight: 1.35, wordBreak: "keep-all" }}>
          좋아하는 과자를 골라 <span style={{ color: FM.blue }}>뜯으면</span>,{vertical ? <br /> : " "}미니게임이 시작돼요.
        </div>
        <ol style={{ margin: vertical ? "8px 0 0" : "10px 0 0", paddingLeft: 18, fontSize: vertical ? 11 : 12, fontWeight: 700, lineHeight: 1.7, wordBreak: "keep-all" }}>
          <li>{vertical ? "선반에 놓인 과자를 천천히 구경하세요" : "선반을 옆으로 밀며 과자를 구경하세요"}</li>
          <li>마음에 드는 과자를 톡 누르면 포장이 열려요</li>
          <li>재밌는 미니 게임을 즐겨보세요!</li>
        </ol>
        <div style={{ marginTop: 10, fontSize: 9, fontWeight: 700, color: "#6B7A83", letterSpacing: ".08em" }}>じゃがりこ · きのこの山 · たべっ子どうぶつ</div>
      </div>
      {/* 음료 안내 메모 — 데스크톱(냉장고가 있는 화면)에서만 */}
      {vertical && (
        <div style={{ width: "100%", maxWidth: 260, background: "#fff", borderRadius: 4, padding: "10px 12px 12px", boxShadow: "0 3px 8px rgba(0,0,0,.12)", position: "relative", fontFamily: "'Noto Sans JP', 'Zen Maru Gothic', sans-serif", color: FM.ink, transform: "rotate(1deg)" }}>
          <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%) rotate(2deg)", width: 40, height: 12, background: "rgba(255,255,255,.7)", border: "1px solid rgba(0,0,0,.08)" }} />
          <div style={{ display: "inline-block", background: FM.blue, color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 2, letterSpacing: ".1em" }}>のみもの · 음료 안내</div>
          <div style={{ fontWeight: 900, fontSize: 15, marginTop: 8, lineHeight: 1.35, wordBreak: "keep-all" }}>
            시원한 <span style={{ color: FM.blue }}>음료</span>도 마실 수 있어요.
          </div>
          <ol style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 11, fontWeight: 700, lineHeight: 1.7, wordBreak: "keep-all" }}>
            <li>냉장고 유리문을 톡 눌러 옆으로 미세요</li>
            <li>마음에 드는 음료를 누르면 꺼내져요</li>
            <li>한 줄을 다 비우면 새로 채워져요</li>
          </ol>
          <div style={{ marginTop: 8, fontSize: 9, fontWeight: 700, color: "#6B7A83", letterSpacing: ".08em" }}>コーラ · お茶 · ジュース · 牛乳</div>
        </div>
      )}
    </div>
  );
}

// 골판지 택배 상자 — 정면에서 본 납작한 2D 일러스트 (윗뚜껑 띠 + 가운데 테이프 + 인쇄 마크)
function CardboardBox({ w = 150, h = 100, style }) {
  const edge = "#8A6437", lid = Math.round(h * 0.2);
  return (
    <div style={{ position: "relative", width: w, height: h, background: "linear-gradient(180deg, #D8B279, #CBA066)", border: `2px solid ${edge}`, borderRadius: 3, boxSizing: "border-box", overflow: "hidden", flexShrink: 0, ...style }}>
      {/* 골판지 결 */}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,.035) 6px 7px)", pointerEvents: "none" }} />
      {/* 윗뚜껑 띠 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: lid, background: "linear-gradient(180deg, #E6C48F, #D8B279)", borderBottom: `2px solid ${edge}` }} />
      {/* 가운데 테이프 */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: Math.round(w * 0.11), marginLeft: -Math.round(w * 0.055), background: "rgba(255,248,230,.45)", borderLeft: "1px solid rgba(0,0,0,.10)", borderRight: "1px solid rgba(0,0,0,.10)" }} />
      {/* 인쇄 마크: 이 면이 위 / 줄무늬 */}
      <div style={{ position: "absolute", right: 10, top: lid + 8, fontSize: Math.round(h * 0.18), lineHeight: 1, fontWeight: 900, color: edge, opacity: .5, letterSpacing: "-.05em" }}>⇧⇧</div>
      <div style={{ position: "absolute", left: 10, bottom: 10, width: Math.round(w * 0.26), height: 5, borderRadius: 2, background: edge, opacity: .28 }} />
      <div style={{ position: "absolute", left: 10, bottom: 19, width: Math.round(w * 0.16), height: 5, borderRadius: 2, background: edge, opacity: .28 }} />
      {/* 바닥 쪽 살짝 어둡게 */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: "rgba(0,0,0,.06)" }} />
    </div>
  );
}

// 상자 위에서 웅크려 자는 회색 고양이 — 숨 쉬듯 배가 오르내리고, 클릭하면 귀·꼬리를 움찔하며 잠깐 눈을 뜬다
function SleepingCat({ width = 150, style }) {
  const [poke, setPoke] = useState(false);
  const fur = "#A9B3BD", furDark = "#7C8894", furLight = "#E6EBEF", pink = "#F2A2B0", ink = "#3C4650";
  const onPoke = () => { if (poke) return; playMeow(); setPoke(true); setTimeout(() => setPoke(false), 900); };
  return (
    <svg className={`cat${poke ? " poke" : ""}`} viewBox="0 0 170 90" width={width} height={width * 90 / 170} style={{ display: "block", overflow: "visible", ...style }} onClick={onPoke} onPointerDown={e => e.stopPropagation()}>
      {/* zzz */}
      <text className="cat-z" x="72" y="26" fontFamily="'Mochiy Pop One', 'Zen Maru Gothic', sans-serif" fontSize="13" fill={ink} opacity=".8">z</text>
      <text className="cat-z cat-z2" x="84" y="16" fontFamily="'Mochiy Pop One', 'Zen Maru Gothic', sans-serif" fontSize="10" fill={ink} opacity=".8">z</text>
      <g className="cat-body">
        {/* 꼬리 — 몸 앞쪽을 감싸듯 */}
        <g className="cat-tail">
          <path d="M126 84 C 160 88, 170 62, 152 55 C 143 52, 138 62, 147 65" fill="none" stroke={fur} strokeWidth="10" strokeLinecap="round" />
          <path d="M126 84 C 160 88, 170 62, 152 55 C 143 52, 138 62, 147 65" fill="none" stroke={furDark} strokeWidth="10" strokeLinecap="round" strokeDasharray="5 11" strokeDashoffset="-14" opacity=".55" />
        </g>
        {/* 몸통(식빵 자세) */}
        <ellipse cx="95" cy="62" rx="58" ry="26" fill={fur} />
        <path d="M100 38 q7 11 2 24" fill="none" stroke={furDark} strokeWidth="6" strokeLinecap="round" opacity=".7" />
        <path d="M119 41 q7 11 2 22" fill="none" stroke={furDark} strokeWidth="6" strokeLinecap="round" opacity=".7" />
        <path d="M137 49 q5 9 0 18" fill="none" stroke={furDark} strokeWidth="5" strokeLinecap="round" opacity=".7" />
        {/* 앞발 */}
        <rect x="50" y="75" width="24" height="12" rx="6" fill={fur} />
        <rect x="76" y="77" width="22" height="11" rx="5.5" fill={fur} />
        <path d="M58 87 v-4 M66 87 v-4 M84 88 v-4 M91 88 v-4" stroke={furDark} strokeWidth="1.5" strokeLinecap="round" opacity=".6" />
        {/* 머리 */}
        <g>
          <g className="cat-ear-l">
            <path d="M20 40 L17 11 L39 27 Z" fill={fur} />
            <path d="M23 36 L21 18 L34 28 Z" fill={pink} opacity=".8" />
          </g>
          <g className="cat-ear-r">
            <path d="M64 40 L67 11 L45 27 Z" fill={fur} />
            <path d="M61 36 L63 18 L50 28 Z" fill={pink} opacity=".8" />
          </g>
          <circle cx="42" cy="52" r="26" fill={fur} />
          <path d="M35 30 v9 M42 28 v10 M49 30 v9" stroke={furDark} strokeWidth="3" strokeLinecap="round" opacity=".7" />
          <ellipse cx="42" cy="61" rx="15" ry="10" fill={furLight} />
          {/* 눈 — 자는 중엔 감고, 건드리면 살짝 뜸 */}
          {poke ? (
            <>
              <ellipse cx="32" cy="50" rx="3.2" ry="4" fill={ink} />
              <ellipse cx="52" cy="50" rx="3.2" ry="4" fill={ink} />
              <circle cx="33" cy="48.5" r="1" fill="#fff" />
              <circle cx="53" cy="48.5" r="1" fill="#fff" />
            </>
          ) : (
            <>
              <path d="M26 50 q6 5 12 0" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M46 50 q6 5 12 0" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}
          <path d="M39 57 h6 l-3 3.5 z" fill={pink} />
          <path d="M42 60.5 q-3 4 -6 2 M42 60.5 q3 4 6 2" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 58 l-12 -2 M22 62 l-12 2 M62 58 l12 -2 M62 62 l12 2" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
        </g>
      </g>
    </svg>
  );
}

// 유리창 아래 쌓아둔 택배 상자 2단 (데스크톱 전용) — 바닥선에 딱 붙이고, 남은 높이가 모자라면 통째로 축소
function BoxPile() {
  const B = { w: 240, h: 145 }, T = { w: 166, h: 102 };
  const padTop = 8, padBottom = 20; // padBottom: GlassStrip의 하단 패딩만큼 내려 바닥선에 붙임
  const CAT = 74; // 위 상자 위 고양이 높이(zzz 포함)
  const W = B.w, H = B.h + T.h + CAT;
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => setScale(Math.max(.45, Math.min(1, (el.clientHeight + padBottom - padTop) / H)));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ flex: 1, minHeight: 0, position: "relative", width: "100%" }}>
      <div style={{ position: "absolute", left: "50%", bottom: -padBottom, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "bottom center", width: W, height: H, overflow: "visible" }}>
        {/* 바닥 그림자 */}
        <div style={{ position: "absolute", left: -6, right: -6, bottom: -3, height: 12, background: "radial-gradient(ellipse at center, rgba(0,0,0,.24), transparent 72%)", filter: "blur(2px)" }} />
        <CardboardBox w={B.w} h={B.h} style={{ position: "absolute", left: 0, bottom: 0 }} />
        {/* 위 상자 — 살짝 왼쪽으로 치우쳐 얹힘 */}
        <CardboardBox w={T.w} h={T.h} style={{ position: "absolute", left: 20, bottom: B.h - 2 }} />
        {/* 위 상자 위에서 자는 고양이 */}
        <SleepingCat width={150} style={{ position: "absolute", left: 20 + (T.w - 150) / 2, bottom: B.h - 2 + T.h - 3 }} />
      </div>
    </div>
  );
}

const OPEN_IMG = { potato: CUP_OPEN_IMG, mushroom: MUSH_OPEN_IMG, animals: ANIM_OPEN_IMG };
// opened art that extends sideways: scale so the box part stays the same size, anchor left
const OPEN_FIT = { mushroom: { scale: 895 / 769, left: true } };
const PKG_W = { carton: 96, cup: 100, box: 122, abox: 150, mbox: 172, bag: 118, small: 84 };
const REAL = {
  potato:   { name: "じゃがりこ サラダ",        sub: "カルビー　57g",        jan: "4901330578909" },
  mushroom: { name: "きのこの山",              sub: "明治　66g",             jan: "4902777237596" },
  animals:  { name: "たべっ子どうぶつ バター味", sub: "ギンビス　63g",        jan: "4901588130652" },
};

function PriceTag({ info, price, scale = 1 }) {
  return (
    <div style={{ flexShrink: 0, width: 128, zoom: scale, background: "#fff", borderRadius: 3, padding: "3px 6px 3px", boxShadow: "0 1px 0 #c9d1ce", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Zen Maru Gothic', sans-serif", color: "#111", lineHeight: 1.15 }}>
      <div style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: ".02em", whiteSpace: "nowrap", overflow: "hidden" }}>{info.name}</div>
      <div style={{ fontSize: 5.5, fontWeight: 700, color: "#333", marginTop: 1, whiteSpace: "nowrap" }}>{info.sub}</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 3 }}>
        <div>
          <div style={{ height: 9, width: 52, background: "repeating-linear-gradient(90deg, #111 0 1px, transparent 1px 2px, #111 2px 4px, transparent 4px 5px, #111 5px 6px, transparent 6px 8px)" }} />
          {info.jan && <div style={{ fontSize: 4.8, letterSpacing: ".14em", color: "#222", marginTop: 1, fontVariantNumeric: "tabular-nums" }}>{info.jan}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ background: "#D0021B", color: "#fff", fontSize: 6, fontWeight: 900, padding: "1px 3px", borderRadius: 2, alignSelf: "center" }}>税込</span>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1 }}>{price}</span>
          <span style={{ fontSize: 7, fontWeight: 900 }}>円</span>
        </div>
      </div>
    </div>
  );
}

// ── flat package art (invented products, kawaii-style face like a mascot) ──
function Art({ type, ac }) {
  const s = { position: "absolute", left: "50%", transform: "translateX(-50%)" };
  if (type === "tomato") return <div style={{ ...s, bottom: 18, width: 46, height: 42, borderRadius: "50%", background: "#E53935", boxShadow: "inset -6px -6px 0 #B71C1C" }}><div style={{ position: "absolute", top: -8, left: 14, width: 18, height: 12, background: "#2E7D32", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} /></div>;
  if (type === "orange") return <div style={{ ...s, bottom: 18, width: 46, height: 46, borderRadius: "50%", background: "radial-gradient(circle, #FFE0B2 0 20%, #FB8C00 22%)", boxShadow: "inset -6px -6px 0 #E65100" }} />;
  if (type === "leaf") return <div style={{ ...s, bottom: 18, width: 26, height: 46, background: "#43A047", borderRadius: "0 100% 0 100%", transform: "translateX(-50%) rotate(-30deg)", boxShadow: "inset -4px -4px 0 #2E7D32" }} />;
  if (type === "berry") return <div style={{ ...s, bottom: 18, width: 36, height: 42, background: "#E91E63", borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%", backgroundImage: "radial-gradient(#FFF59D 1.5px, transparent 2px)", backgroundSize: "9px 9px" }}><div style={{ position: "absolute", top: -6, left: 8, width: 20, height: 10, background: "#2E7D32", borderRadius: "50%" }} /></div>;
  if (type === "bean") return <div style={{ ...s, bottom: 20, width: 34, height: 46, background: "#5D4037", borderRadius: "50%", transform: "translateX(-50%) rotate(20deg)" }}><div style={{ position: "absolute", top: 8, left: 15, width: 4, height: 30, background: "#3E2723", borderRadius: 2 }} /></div>;
  if (type === "chips") return <div style={{ ...s, bottom: 14, display: "flex", gap: 2 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 30, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#F5C542", boxShadow: "inset 0 -4px 0 #D4A017", transform: `rotate(${(i - 1) * 18}deg)` }} />)}</div>;
  if (type === "cube") return <div style={{ ...s, bottom: 16, display: "flex", gap: 3 }}>{[0, 1].map((i) => <div key={i} style={{ width: 22, height: 22, borderRadius: 5, background: "#FFB74D", boxShadow: "inset -4px -4px 0 #EF6C00", transform: `rotate(${i * 15 - 5}deg)` }} />)}</div>;
  return <div style={{ ...s, bottom: 18, display: "flex", gap: 3 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: ["#64B5F6", "#F48FB1", "#FFF176"][i] }} />)}</div>;
}
function Face({ color }) {
  return <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
    <div style={{ display: "flex", gap: 10 }}><div style={{ width: 4, height: 6, borderRadius: 2, background: color }} /><div style={{ width: 4, height: 6, borderRadius: 2, background: color }} /></div>
    <div style={{ width: 8, height: 4, borderBottom: `2px solid ${color}`, borderRadius: "0 0 8px 8px" }} />
  </div>;
}

function Package({ item, h }) {
  const w = PKG_W[item.kind];
  const base = { width: w, height: h, flexShrink: 0, position: "relative", background: item.bg, boxShadow: `inset -6px 0 0 rgba(0,0,0,.12), inset 0 0 0 3px ${item.ac}22` };
  const label = (
    <div style={{ position: "absolute", left: 6, right: 6, top: h * 0.3, textAlign: "center" }}>
      <div style={{ fontFamily: F.disp, fontSize: item.kind === "small" ? 12 : 15, color: item.ac, lineHeight: 1.1 }}>{item.name}</div>
      <div style={{ fontSize: 7, fontWeight: 700, color: item.ac, opacity: .8, marginTop: 2, letterSpacing: ".08em" }}>{item.sub}</div>
    </div>
  );
  if (item.kind === "carton") return <div style={{ ...base, borderRadius: "4px 4px 0 0", clipPath: "polygon(0 8%, 50% 0, 100% 8%, 100% 100%, 0 100%)" }}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${8}%`, background: item.ac, opacity: .25 }} /><Face color={item.ac} />{label}<Art type={item.art} ac={item.ac} /></div>;
  if (item.kind === "bag") return <div style={{ ...base, clipPath: "polygon(4% 0, 96% 0, 100% 5%, 97% 95%, 92% 100%, 8% 100%, 3% 95%, 0 5%)", boxShadow: "inset 0 0 0 4px rgba(255,255,255,.35)" }}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "repeating-linear-gradient(90deg, #fff8 0 3px, transparent 3px 6px)" }} /><Face color={item.ac} />{label}<Art type={item.art} ac={item.ac} /><div style={{ position: "absolute", bottom: 4, right: 10, fontSize: 7, fontWeight: 700, color: item.ac }}>60g</div></div>;
  return <div style={{ ...base, borderRadius: 3 }}><Face color={item.ac} />{label}<Art type={item.art} ac={item.ac} /></div>;
}

// ── our three real products (original designs) ──
function RealPackage({ item, h, active, onClick, scale = 1 }) {
  const w = PKG_W[item.kind] * scale;
  const opened = active && OPEN_IMG[item.key];
  return (
    <button className="boxBtn" data-silent onClick={onClick} aria-label="상자 열기" style={{ width: w, height: h, flexShrink: 0, position: "relative", animation: active && !opened ? "zoomIn .65s ease-in forwards" : "none", zIndex: active ? 4 : 1 }}>
      {opened && (
        <img src={OPEN_IMG[item.key]} alt="" draggable={false} style={{ position: "absolute", left: OPEN_FIT[item.key]?.left ? 0 : "50%", bottom: 0, transform: OPEN_FIT[item.key]?.left ? "none" : "translateX(-50%)", transformOrigin: "bottom left", width: w * (OPEN_FIT[item.key]?.scale || 1), height: "auto", maxWidth: "none", animation: `${OPEN_FIT[item.key]?.left ? "openPopL" : "openPop"} .35s cubic-bezier(.2,.9,.3,1.3) both`, filter: "drop-shadow(0 8px 12px rgba(0,0,0,.25))" }} />
      )}
      {!opened && item.key === "potato" && (
        <img src={CUP_IMG} alt="" draggable={false} style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", objectPosition: "bottom" }} />
      )}
      {!opened && item.key === "mushroom" && (
        <img src={MUSH_IMG} alt="" draggable={false} style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", objectPosition: "bottom" }} />
      )}
      {!opened && item.key === "animals" && (
        <img src={ANIM_IMG} alt="" draggable={false} style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", objectPosition: "bottom" }} />
      )}
    </button>
  );
}

// ── 게임 공통: 데스크톱 좌우 분할 (왼쪽 안내 패널 | 오른쪽 플레이 영역) ──
const GAME_COLS = "clamp(300px, 27vw, 420px) 1fr";
function SidePanel({ bg, border, color, children }) {
  return (
    <aside style={{ position: "relative", zIndex: 3, background: bg, color, borderRight: `5px solid ${border}`, display: "flex", flexDirection: "column", minHeight: 0, overflow: "auto", boxShadow: "6px 0 28px rgba(0,0,0,.10)" }}>
      {children}
    </aside>
  );
}
const PANEL_BODY = { padding: "18px 24px 26px", display: "flex", flexDirection: "column", gap: 22, flex: 1 };
const PANEL_GROUP = { margin: "auto 0", display: "flex", flexDirection: "column", gap: 22 }; // 타이틀·설명·점수 묶음을 세로 가운데로
function useDesktop() { return useMedia("(min-width: 900px)"); }

// ═════════════════════════════════════════════════════════════
// SCENE 2 · POTATO STICK CUP — 드래그해서 쌓는 탑
// ═════════════════════════════════════════════════════════════
const P = { green: "#1E8A4C", greenDeep: "#0F3D25", greenLite: "#5FC27C", cream: "#F3DC8F", creamDeep: "#D9B85A", butter: "#FFF3BF", fleck: "#3E9A3A", red: "#E2503C" };

function Stick({ w = 18, h = 110, style }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 6, background: `radial-gradient(circle at 30% 20%, ${P.fleck} 0 1.3px, transparent 1.6px), radial-gradient(circle at 70% 55%, ${P.fleck} 0 1.2px, transparent 1.5px), linear-gradient(90deg, ${P.creamDeep}, ${P.cream} 35%, #FBEBB0 60%, ${P.creamDeep})`, backgroundSize: "18px 34px, 18px 34px, 100% 100%", boxShadow: "inset 0 -2px 0 rgba(120,80,0,.25), 0 2px 4px rgba(60,30,0,.15)", ...style }} />
  );
}

// 컵 사진(847×913, 정면) — 표시 폭 기준으로 환산. cy = 컵 윗선, rx = 윗선 반폭. 스틱은 컵 뒤에 서서 윗선 위로만 보인다
const CUP_W = 250, CUP_S = CUP_W / 847;
const CUP = { w: CUP_W, h: Math.round(913 * CUP_S), cx: 425 * CUP_S, cy: 18 * CUP_S, rx: 414 * CUP_S };
// 접시 사진 — 표시 폭 330px. 안쪽 평평한 면의 중심(위에서 52%)에 탑 밑바닥을 놓는다
const PLATE_W = 330, PLATE_H = Math.round(PLATE_W * 397 / 1028), PLATE_TOP_Y = Math.round(PLATE_H * 0.52), TOWER_BOTTOM = PLATE_H - PLATE_TOP_Y;
const STICK_H = 150, STICK_W = Math.round(STICK_H * 140 / 800); // 스틱 사진 비율 유지 (굵기 ≈ 컵 폭의 1/9)
// 컵 속 스틱 배치: 뒤·중간·앞 세 줄로 입구를 채운다 (base = 입구 타원 중심 기준 아랫단 y, z = 깊이)
const CUP_ROWS = [{ base: -9, n: 7 }, { base: 0, n: 7 }, { base: 9, n: 6 }];
function mkStick(id, row, i) {
  const r = CUP_ROWS[row], span = CUP.rx * 0.74 * 2;
  return { id, row, i, x: -CUP.rx * 0.74 + (r.n === 1 ? span / 2 : i * span / (r.n - 1)) + rand(-5, 5) - STICK_W / 2, top: r.base - rand(46, 80), tilt: rand(-4, 4) + (i - (r.n - 1) / 2) * 2.2, flip: Math.random() < .5 };
}

// ── 탑 기하 ───────────────────────────────────────────────────
// 한 층 = 눕힌 스틱 1개
const LAYER_W = 116, LAYER_H = 20, LAYER_STEP = 20;
const MAX_LAYERS = 20;                // 여기까지 쌓으면 완성
const PLAY_H = 520;                   // 플레이 영역 높이 — 접시 위 20층(61 + 400)이 들어온다
const SUPPORT = LAYER_W / 2 * 0.95;   // 아래 층이 위쪽 무게를 받아줄 수 있는 반폭
const PLATE_SUPPORT = PLATE_W * 0.32; // 접시 안쪽 평면의 반폭 — 여기를 벗어나게는 놓지 못한다
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// 젠가 물리의 단순 버전 — 각 접촉면에서 그 위 층들의 무게중심이 지지 폭 안에 있어야 한다
function stability(layers) {
  let risk = 0, dir = 1;
  for (let i = 0; i < layers.length; i++) {
    const above = layers.slice(i);
    const com = above.reduce((s, l) => s + l.x, 0) / above.length;
    const cx = layers[Math.max(0, i - 1)].x; // i층이 딛고 선 면의 중심 (0층은 접시에 닿은 자기 밑면)
    const r = Math.abs(com - cx) / SUPPORT;
    if (r > risk) { risk = r; dir = Math.sign(com - cx) || 1; }
  }
  return { ok: risk <= 1, risk, dir };
}

// 스틱 사진 — 세로(컵 안)와 눕힌 것(탑) 두 가지로 쓴다
function StickImg({ h = STICK_H, style }) {
  return <img className="stickImg" src={STICK_IMG} alt="" draggable={false} style={{ height: h, width: Math.round(h * 140 / 800), ...style }} />;
}
function StickSide({ w = 110, h = 20 }) { // 가로로 눕힌 스틱
  return (
    <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <StickImg h={w} style={{ transform: "rotate(90deg)", flexShrink: 0 }} />
    </div>
  );
}
// 스틱 3D — 비스킷과 같은 방식: 같은 실루엣을 translateZ로 겹쳐 두께를 내고, 포인터 위치에 따라 기울인다
const STICK_DEPTH = 5;
function Stick3D({ h = STICK_H, flip }) {
  const [tilt, setTilt] = useState(null);
  const ref = useRef(null);
  const w = Math.round(h * 140 / 800);
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    setTilt({ x: -py * 28, y: px * 56 });
  }
  const body = tilt ? { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: "transform .08s" } : { transition: "transform .5s cubic-bezier(.2,.9,.3,1.2)" };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={() => setTilt(null)} onPointerCancel={() => setTilt(null)} style={{ position: "relative", width: w, height: h, perspective: h * 2.5, filter: "drop-shadow(0 3px 3px rgba(60,30,0,.25))" }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", ...body }}>
        {Array.from({ length: STICK_DEPTH }, (_, i) => (
          <div key={i} className="bisLayer" style={{ background: "#CFAE5E", WebkitMaskImage: `url(${STICK_IMG})`, maskImage: `url(${STICK_IMG})`, transform: `translateZ(${-(i + 1) * 2}px)` }} />
        ))}
        <img src={STICK_IMG} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", userSelect: "none", transform: flip ? "scaleX(-1)" : "none" }} />
      </div>
    </div>
  );
}
// 탑의 한 층
function Layer() { return <StickSide w={LAYER_W} h={LAYER_H} />; }

function PotatoScene({ onBack }) {
  const mk = () => CUP_ROWS.flatMap((r, row) => Array.from({ length: r.n }, (_, i) => mkStick(row * 10 + i, row, i)));
  const [cupSticks, setCupSticks] = useState(mk);
  const [tower, setTower] = useState(() => { const n = Math.min(MAX_LAYERS, +new URLSearchParams(window.location.search).get("tower") || 0); return Array.from({ length: n }, (_, i) => ({ id: -1 - i, x: rand(-14, 14), wob: rand(-1.6, 1.6) })); }); // ?tower=5 로 쌓인 상태 확인 (개발용)
  const [held, setHeld] = useState(null); // 손에 들고 있는 스틱 { id, px, py, x, over }
  const [toppled, setToppled] = useState(false);
  const [rattle, setRattle] = useState(false);
  const [particles, setParticles] = useState([]);
  const [flash, setFlash] = useState(0); // 방금 놓인 층 번호 (통통 튀는 연출)
  const idRef = useRef(100);

  const desktop = useDesktop();
  const areaRef = useRef(null);
  const anchorRef = useRef(null); // 탑 밑바닥 기준점 (접시 안쪽 중심)
  const { w: aw, h: ah } = useSize(areaRef);
  const PLAY_W = desktop ? 760 : 620; // 모바일은 컵·접시 사이 여백을 줄여 더 크게 보이게 한다
  const k = !aw ? 1 : desktop
    ? clamp(Math.min((aw - 48) / 760, (ah - 48) / (PLAY_H + 30)), 1, 1.7) // 데스크톱: 남는 공간만큼 확대
    : clamp(Math.min((aw - 12) / PLAY_W, (ah - 12) / PLAY_H), 0.5, 1.15); // 모바일: 화면 폭·남은 높이에 맞춰 축소

  // 포인터 핸들러가 최신 값을 보도록 거울 ref를 둔다 (드래그 중 리스너를 다시 붙이지 않기 위해)
  const heldRef = useRef(null), towerRef = useRef(tower), kRef = useRef(k), topRef = useRef(false);
  towerRef.current = tower; kRef.current = k; topRef.current = toppled;
  const setHold = (v) => { heldRef.current = typeof v === "function" ? v(heldRef.current) : v; setHeld(heldRef.current); };

  // 화면 좌표 → 탑 기준 좌표 (플레이 영역이 scale(k) 되어 있으므로 되돌린다)
  function project(cx, cy) {
    const el = anchorRef.current;
    if (!el) return { x: 0, y: 0, over: false };
    const r = el.getBoundingClientRect();
    const x = (cx - r.left) / kRef.current, y = (r.top - cy) / kRef.current;
    return { x, y, over: Math.abs(x) < 200 && y > -70 && y < 520 };
  }

  // 컵에서 스틱을 잡는다 — 뽑혀 날아가는 대신 그대로 손에 들린다
  function grab(e, s) {
    if (heldRef.current || toppled || towerRef.current.length >= MAX_LAYERS) return;
    e.preventDefault(); e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { }
    playStickGrab();
    setHold({ id: s.id, px: e.clientX, py: e.clientY, ...project(e.clientX, e.clientY) });
  }
  // 손을 뗀 자리를 그 층의 위치로 삼는다. 컵에는 새 스틱이 솟아오른다
  function release(place) {
    const h = heldRef.current; if (!h) return;
    const t = towerRef.current;
    if (place && h.over && !topRef.current && t.length < MAX_LAYERS) {
      const x = clamp(h.x, -PLATE_SUPPORT, PLATE_SUPPORT);
      const next = [...t, { id: idRef.current++, x, wob: rand(-1.6, 1.6) }];
      setTower(next);
      playStickPlace();
      setFlash(next.length); setTimeout(() => setFlash(0), 400);
      const st = stability(next);
      if (!st.ok) setTimeout(() => topple(st.dir), 300);
      else if (next.length >= MAX_LAYERS) setTimeout(playClear, 350); // 20층 완성 — 놓는 소리 뒤에 축하 멜로디
    }
    setCupSticks((p) => p.map((c) => (c.id === h.id ? { ...mkStick(idRef.current++, c.row, c.i), fresh: true } : c)));
    setHold(null);
  }

  const dragging = !!held;
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => setHold((h) => h && { ...h, px: e.clientX, py: e.clientY, ...project(e.clientX, e.clientY) });
    const up = () => release(true);
    const cancel = () => release(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", cancel); };
  }, [dragging]);

  function topple(dir = 1) {
    setToppled(true);
    playStickTopple();
    setTower((t) => t.map((l, i) => {
      const to = clamp(l.x * 0.3 + dir * (12 + i * 9) + rand(-22, 22), -PLATE_SUPPORT - 26, PLATE_SUPPORT + 26);
      return { ...l, fx: to - l.x, fy: i * LAYER_STEP - rand(0, 6), fr: dir * (25 + i * 16) + rand(-18, 18) };
    }));
    setParticles(Array.from({ length: 26 }, (_, i) => ({ id: i, x: rand(-160, 160), y: rand(-220, -40), r: rand(0, 360), s: rand(0.5, 1.2), d: rand(0, 0.25), kind: i % 5 === 0 ? "word" : i % 2 ? "fleck" : "crumb" })));
  }
  function reset() { setTower([]); setToppled(false); setParticles([]); }
  function shake() { if (heldRef.current) return; setRattle(true); setTimeout(() => setRattle(false), 500); }

  // 안정도 — 지금 탑이 얼마나 위태로운지. 놓기 전 미리보기도 같은 규칙으로 판정한다
  const st = useMemo(() => stability(tower), [tower]);
  const topX = tower.length ? tower[tower.length - 1].x : 0;
  const snapX = held ? clamp(held.x, -PLATE_SUPPORT, PLATE_SUPPORT) : 0;
  const aiming = !!held && held.over && !toppled;
  const preview = useMemo(() => (aiming ? stability([...tower, { x: snapX }]) : null), [aiming, snapX, tower]);
  const okNow = !preview || preview.ok;
  const lean = toppled ? 0 : st.dir * Math.max(0, st.risk - 0.35) / 0.65 * 7; // 위태로울수록 그쪽으로 기운다
  const amp = toppled ? 0 : Math.min(6, tower.length * 0.4 + st.risk * 3);
  const shaky = !toppled && st.risk > 0.72;
  const done = !toppled && tower.length >= MAX_LAYERS; // 20층 완성 — 더는 쌓지 못한다
  const left = MAX_LAYERS - tower.length;
  const guideW = tower.length ? SUPPORT : PLATE_SUPPORT;

  const pattern = <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(45deg, ${P.greenLite}22 25%, transparent 25%, transparent 75%, ${P.greenLite}22 75%), linear-gradient(45deg, ${P.greenLite}22 25%, transparent 25%, transparent 75%, ${P.greenLite}22 75%)`, backgroundSize: "40px 40px", backgroundPosition: "0 0, 20px 20px", opacity: 0.6, pointerEvents: "none" }} />;
  const title = (
    <div>
      <h1 style={{ fontFamily: F.disp, fontSize: desktop ? "clamp(40px, 3.6vw, 56px)" : "clamp(34px, 7vw, 64px)", lineHeight: 1.05, margin: 0, color: P.green, textShadow: `3px 3px 0 ${P.cream}` }}>ポテト<br />スティック</h1>
      <div style={{ marginTop: desktop ? 16 : 8, fontSize: 13, fontWeight: 700, letterSpacing: ".18em", color: P.green, opacity: .8 }}>감자 스틱 탑 쌓기</div>
      <p style={{ margin: desktop ? "34px 0 0" : "10px 0 0", maxWidth: 320, fontSize: desktop ? 17 : 14, lineHeight: desktop ? 1.85 : 1.6, fontWeight: 700, wordBreak: "keep-all" }}>{desktop ? <>컵에서 과자를 드래그해 접시 위에 놓으세요.<br />놓은 자리 그대로 층이 쌓여요.<br />균형이 안 맞으면 와르르 무너지니 조심!</> : <>스틱을 잡아 접시 위로 끌어다 놓으세요.<br />무게중심이 아래 층을 벗어나면 무너져요.</>}</p>
    </div>
  );
  const scoreBox = (
    <div style={{ textAlign: desktop ? "left" : "right" }}>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 60 : 44, color: P.red, lineHeight: 1 }}>{toppled ? 0 : left}<span style={{ fontSize: desktop ? 24 : 18, marginLeft: 4 }}>/{MAX_LAYERS}</span></div>
      <div style={{ fontSize: desktop ? 15 : 12, fontWeight: 700, letterSpacing: ".1em", marginTop: desktop ? 4 : 0 }}>남은 층</div>
    </div>
  );
  const status = toppled ? (
    <>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 34 : 26, color: P.red, animation: "floaty 1.4s ease-in-out infinite" }}>くずれた！</div>
      <div style={{ marginTop: 6, fontSize: desktop ? 16 : 13, fontWeight: 700, letterSpacing: ".14em", color: P.green, opacity: .8 }}>{tower.length}층에서 무너졌어요!</div>
      <button className="btn" onClick={reset} style={{ marginTop: 12, background: P.green, color: P.cream, boxShadow: `0 4px 0 ${P.greenDeep}`, fontSize: desktop ? 16 : 14, padding: desktop ? "12px 24px" : "10px 18px" }}>다시 쌓기</button>
    </>
  ) : done ? (
    <>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 34 : 26, color: P.green, animation: "floaty 1.4s ease-in-out infinite" }}>かんせい！</div>
      <div style={{ marginTop: 6, fontSize: desktop ? 16 : 13, fontWeight: 700, letterSpacing: ".14em", color: P.green, opacity: .8 }}>{MAX_LAYERS}층 완성! 다 쌓았어요</div>
      <button className="btn" onClick={reset} style={{ marginTop: 12, background: P.green, color: P.cream, boxShadow: `0 4px 0 ${P.greenDeep}`, fontSize: desktop ? 16 : 14, padding: desktop ? "12px 24px" : "10px 18px" }}>다시 쌓기</button>
    </>
  ) : tower.length === 0 ? (
    <div style={{ fontSize: desktop ? 16 : 13, fontWeight: 700, color: P.green, animation: "floaty 1.6s ease-in-out infinite" }}>{desktop ? "스틱을 잡고 접시로 끌어오세요 →" : "← 스틱을 잡고 접시로 끌어오세요"}</div>
  ) : (
    <>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 34 : 26, color: shaky ? P.red : P.green }}>{tower.length}층</div>
      {shaky && <div style={{ marginTop: 4, fontSize: desktop ? 15 : 12, fontWeight: 700, color: P.red, animation: "floaty .7s ease-in-out infinite" }}>위태위태…</div>}
      <button className="btn" onClick={() => topple(st.dir)} style={{ marginTop: 12, background: "transparent", color: P.green, border: `2px solid ${P.green}`, fontSize: desktop ? 14 : 12, padding: desktop ? "8px 18px" : "6px 14px" }}>무너뜨리기</button>
    </>
  );
  const play = (
    <main style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "end", width: PLAY_W, height: PLAY_H, padding: desktop ? "0 24px" : "0 6px", transform: `scale(${k})`, transformOrigin: "center center", flexShrink: 0, touchAction: "none" }}>
      <div style={{ position: "relative", height: 420, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
        <div onClick={shake} role="button" aria-label="컵 흔들기" style={{ position: "relative", width: CUP.w, height: CUP.h, animation: rattle ? "rattle .12s linear 4" : "none", cursor: "pointer" }}>
          {/* 바닥 그림자 */}
          <div style={{ position: "absolute", left: "8%", right: "8%", bottom: 4, height: 26, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(60,30,0,.28), rgba(60,30,0,0) 70%)" }} />
          {/* 스틱: 컵 뒤에 세 줄로 서 있고, 각 스틱은 포인터 따라 기울어지는 3D */}
          <div style={{ position: "absolute", left: CUP.cx, top: CUP.cy, width: 0, height: 0 }}>
            {cupSticks.map((s) => (
              <div key={s.id} style={{ position: "absolute", left: s.x, top: s.top, zIndex: s.row + 1, transform: `rotate(${s.tilt}deg)`, transformOrigin: "50% 40px", opacity: held && held.id === s.id ? 0 : 1 }}>
                <button className="stickBtn" data-silent onPointerDown={(e) => grab(e, s)} onClick={(e) => e.stopPropagation()} aria-label="스틱 잡기" style={{ animation: s.fresh ? "rise .45s cubic-bezier(.2,.9,.3,1.2)" : rattle ? "rattle .12s linear 4" : "none" }}><Stick3D flip={s.flip} /></button>
              </div>
            ))}
          </div>
          {/* 컵 (정면) — 스틱 아랫부분을 가린다 */}
          <img src={CUP_REAL_IMG} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }} />
        </div>
      </div>

      <div style={{ position: "relative", height: 420, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
        {/* 접시 — 바닥 그림자 + 사진 */}
        <div style={{ position: "absolute", bottom: 6, width: PLATE_W * .9, height: 30, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(60,30,0,.30), rgba(60,30,0,0) 70%)" }} />
        <img src={PLATE_IMG} alt="" draggable={false} style={{ position: "absolute", bottom: 0, width: PLATE_W, height: PLATE_H, pointerEvents: "none", filter: "drop-shadow(0 4px 4px rgba(60,30,0,.18))" }} />

        {/* 탑 — 접시 안쪽 중심을 기준점으로 두고 층을 절대 배치한다 */}
        <div ref={anchorRef} style={{ position: "absolute", bottom: TOWER_BOTTOM, left: "50%", width: 0, height: 0 }}>
          <div style={{ position: "absolute", left: 0, bottom: 0, width: 0, height: 0, transform: `rotate(${lean}deg)`, transformOrigin: "0 0", transition: "transform .35s cubic-bezier(.3,.9,.4,1.2)" }}>
            {/* 놓을 자리 가이드 — 끌고 있는 동안만 보인다 */}
            {aiming && (
              <div style={{ position: "absolute", left: 0, bottom: tower.length * LAYER_STEP, width: 0, height: 0, pointerEvents: "none", zIndex: 20 }}>
                <div style={{ position: "absolute", left: topX - guideW, bottom: -4, width: guideW * 2, height: 3, borderRadius: 2, background: okNow ? P.green : P.red, opacity: .55, transition: "background .15s" }} />
                <div style={{ position: "absolute", left: topX - 1, bottom: -10, width: 2, height: 15, borderRadius: 1, background: okNow ? P.green : P.red, opacity: .45 }} />
                <div style={{ position: "absolute", left: snapX - LAYER_W / 2, bottom: 1, opacity: okNow ? .55 : .35, filter: okNow ? "none" : "grayscale(.7)" }}><Layer /></div>
              </div>
            )}
            {/* 층 — 흔들림은 조준하는 동안 멈춘다 */}
            <div style={{ position: "absolute", left: 0, bottom: 0, width: 0, height: 0, "--amp": amp, animation: tower.length && !held && !toppled && !done ? `wobble ${Math.max(0.6, 1.8 - tower.length * 0.15)}s ease-in-out infinite` : "none", transformOrigin: "0 0" }}>
              {tower.map((layer, i) => (
                <div key={layer.id} style={{ position: "absolute", left: layer.x - LAYER_W / 2, bottom: i * LAYER_STEP, width: LAYER_W, height: LAYER_H, zIndex: 10 - i, animation: toppled ? `tumble .62s cubic-bezier(.4,0,.7,1) ${(tower.length - 1 - i) * 0.035}s forwards` : "none", "--x": `${layer.fx || 0}px`, "--y": `${layer.fy || 0}px`, "--r": `${layer.fr || 0}deg` }}>
                  <div style={{ position: "relative", transform: `rotate(${layer.wob}deg)`, animation: !toppled && flash === i + 1 ? "placePop .3s cubic-bezier(.3,.9,.4,1.4)" : "none" }}>
                    <Layer />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {particles.map((p) => (
          <div key={p.id} style={{ position: "absolute", bottom: TOWER_BOTTOM + 30, left: "50%", "--x": `${p.x}px`, "--y": `${p.y}px`, "--r": `${p.r}deg`, "--s": p.s, animation: `pop 1.1s ease-out ${p.d}s forwards`, opacity: 0, pointerEvents: "none" }}>
            {p.kind === "word" ? <span style={{ fontFamily: F.disp, color: P.red, fontSize: 18, textShadow: `2px 2px 0 ${P.cream}` }}>サラダ！</span> : p.kind === "fleck" ? <div style={{ width: 8, height: 8, borderRadius: 3, background: P.fleck }} /> : <div style={{ width: 12, height: 9, borderRadius: 3, background: P.cream, boxShadow: `inset 0 -2px 0 ${P.creamDeep}` }} />}
          </div>
        ))}
      </div>
    </main>
  );

  // 손에 들린 스틱 — 화면 좌표를 그대로 따라다닌다
  const inHand = held && (
    <div style={{ position: "fixed", left: held.px, top: held.py, zIndex: 60, pointerEvents: "none", transform: `translate(-50%, -50%) scale(${k * (held.over ? 1 : .88)}) rotate(${held.over ? 0 : -16}deg)`, transition: "transform .18s", filter: "drop-shadow(0 8px 8px rgba(60,30,0,.3))" }}>
      <Layer />
    </div>
  );

  if (desktop) {
    return (
      <>
        <div className="scene" style={{ height: "100vh", display: "grid", gridTemplateColumns: GAME_COLS, background: P.butter, color: P.greenDeep, overflow: "hidden", cursor: held ? "grabbing" : "auto" }}>
          <SidePanel bg="#FFF9DD" border={P.green} color={P.greenDeep}>
            <TopBar index="03" title="じゃがりこ" color={P.green} onBack={onBack} />
            <div style={{ ...PANEL_BODY, paddingLeft: 40 }}>
              <div style={{ ...PANEL_GROUP, margin: "7vh 0 auto" }}>
                {title}
                {scoreBox}
                {/* 탑 상태 — 점수 바로 아래 (애니멀의 비스킷 격자와 같은 자리) */}
                <div style={{ marginTop: 14 }}>{status}</div>
              </div>
            </div>
          </SidePanel>
          <section ref={areaRef} style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {pattern}
            {play}
          </section>
        </div>
        {inHand}
      </>
    );
  }
  return (
    <>
      <div className="scene" style={{ height: "100dvh", minHeight: 560, background: P.butter, color: P.greenDeep, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        {pattern}
        <TopBar index="03" color={P.green} onBack={onBack} />
        <header style={{ position: "relative", padding: "12px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          {title}
          <div style={{ textAlign: "right" }}>{scoreBox}<div style={{ marginTop: 10 }}>{status}</div></div>
        </header>
        <section ref={areaRef} style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden", paddingBottom: 10 }}>
          {play}
        </section>
      </div>
      {inHand}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// SCENE 3 · MUSHROOM CHOCOLATE HILL
// ═════════════════════════════════════════════════════════════
const M = { choco: "#3E2010", chocoLite: "#7A4620", stem: "#FFF3D6", stemDeep: "#E8D3A6", grass: "#8BC34A", grassDeep: "#5C9A2E", sky: "#FFD84A", dusk: "#F08A5D", night: "#2C2A5E", ink: "#5B3A1E" };

// 갓·줄기 이미지는 선택 사항 — src/assets/mushroom-cap.png / mushroom-stem.png 를 넣으면 자동으로 쓰고, 없으면 CSS 도형으로 그린다
const MUSH_PART = import.meta.glob("./assets/mushroom-{cap,stem}.png", { eager: true, query: "?url", import: "default" });
const CAP_IMG = MUSH_PART["./assets/mushroom-cap.png"];
const STEM_IMG = MUSH_PART["./assets/mushroom-stem.png"];
const CAP_RATIO = 401 / 435, STEM_RATIO = 511 / 221; // 높이/폭 — 실제 사진 비율 (mushroom-cap.png 435×401, mushroom-stem.png 221×511)
// 언덕 슬롯 — 뒤 9 · 중간 8 · 앞 7 = 24자리. 갓도 딱 이 수만큼 떨어지고, 전부 받으면 언덕이 가득 찬다
// x: 화면 폭 기준 %, y: 언덕 띠 높이 기준 % (아래에서), sc: 크기 배율 (앞줄일수록 큼)
const HILL_SLOTS = (() => {
  const rows = [
    { n: 9, y: 54, sc: 0.5, x0: 7, x1: 93 },
    { n: 8, y: 29, sc: 0.61, x0: 10, x1: 90 },
    { n: 7, y: 4, sc: 0.72, x0: 13, x1: 87 },
  ];
  const out = [];
  rows.forEach((r, ri) => { for (let i = 0; i < r.n; i++) out.push({ x: r.x0 + (r.x1 - r.x0) * (i / (r.n - 1)), y: r.y, sc: r.sc, z: ri + 1 }); });
  return out;
})();
const N_CAPS = HILL_SLOTS.length;
const HILL = 0.28;       // 화면 아래 언덕 비율
// 언덕 윗선의 y (화면 위에서부터). 언덕 div 는 좌우로 10% 씩 삐져나가고 border-radius "50% 50% 0 0 / 30% 30% 0 0" 라
// 윗선 전체가 반지름 (0.6w, 0.3·언덕높이) 인 타원 호다. 줄기·부스러기가 이 곡선 위에 놓여야 공중에 뜨지 않는다
function hillTopAt(x, w, h) {
  const rx = 0.6 * w, ry = 0.3 * HILL * h;
  const d = (x + 0.1 * w - rx) / rx;
  return h - HILL * h + ry * (1 - Math.sqrt(Math.max(0, 1 - d * d)));
}
const lerp = (a, b, t) => a + (b - a) * t;

function ChocoCap({ w, style }) {
  const h = w * CAP_RATIO;
  if (CAP_IMG) return <img src={CAP_IMG} alt="" draggable={false} style={{ width: w, height: h, objectFit: "contain", objectPosition: "bottom", display: "block", pointerEvents: "none", ...style }} />;
  return <div style={{ width: w, height: h, borderRadius: "50% 50% 12% 12% / 70% 70% 14% 14%", background: `linear-gradient(135deg, ${M.chocoLite}, ${M.choco} 60%)`, boxShadow: "inset 4px 4px 6px rgba(255,255,255,.18), 0 3px 0 #2A1508", ...style }} />;
}
function BiscuitStem({ w, style }) {
  const h = w * STEM_RATIO;
  if (STEM_IMG) return <img src={STEM_IMG} alt="" draggable={false} style={{ width: w, height: h, objectFit: "contain", objectPosition: "bottom", display: "block", pointerEvents: "none", ...style }} />;
  return <div style={{ width: w, height: h, borderRadius: "22% 22% 40% 40% / 8% 8% 14% 14%", background: `linear-gradient(90deg, ${M.stemDeep}, ${M.stem} 45%, ${M.stemDeep})`, boxShadow: "inset 0 -4px 0 #D9C08C", ...style }} />;
}

function MushroomScene({ onBack }) {
  const desktop = useDesktop();
  const areaRef = useRef(null);
  const dims = useSize(areaRef);
  const measure = () => { const el = areaRef.current; return el ? { w: el.clientWidth, h: el.clientHeight } : dims; }; // 실제 크기는 매번 요소에서 직접 읽는다

  const capW = desktop ? 92 : 66, capH = capW * CAP_RATIO;
  const stemW = capW * 0.52, stemH = stemW * STEM_RATIO;
  const OVERLAP = stemH * 0.26; // 줄기 윗부분이 이만큼 갓 안으로 들어간다 (실제 きのこの山 처럼)

  const devT = new URLSearchParams(window.location.search).get("mush"); // ?mush=0.7 로 그 시각부터 바로 플레이 (개발용)
  const [phase, setPhase] = useState(devT != null ? "play" : "ready"); // ready → play → done
  const [, setFrame] = useState(0);
  const g = useRef(null);
  const stars = useMemo(() => Array.from({ length: 46 }, (_, i) => ({ id: i, x: rand(0, 100), y: rand(0, 62), s: rand(1.5, 3.2), d: rand(0, 3) })), []);

  function fresh() {
    const { w } = measure();
    const t0 = devT != null ? clamp(+devT || 0, 0, 0.99) : 0;
    const order = HILL_SLOTS.map((_, i) => i).sort(() => Math.random() - 0.5); // 이번 판에 슬롯이 채워지는 순서
    const dropped = Math.round(t0 * N_CAPS);
    const planted = Array.from({ length: Math.round(dropped * 0.8) }, (_, i) => ({ id: -1 - i, slot: order[i] }));
    return { t: t0, x: w / 2, tx: w / 2, caps: [], crumbs: [], order, planted, missed: 0, dropped, interval: 1.2, spawn: 1.2, hold: 0, nextId: 1, pending: 0 };
  }
  if (!g.current) g.current = fresh();
  const s = g.current;

  function start() { g.current = fresh(); setPhase("play"); }

  // 포인터 위치 → 줄기 목표 x
  const onPointer = (e) => { const r = e.currentTarget.getBoundingClientRect(); g.current.tx = e.clientX - r.left; };

  useEffect(() => {
    if (phase !== "play") return;
    let raf, last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = g.current, { w, h } = measure();
      if (!w || !h) { raf = requestAnimationFrame(step); return; }
      const groundAt = (x) => hillTopAt(x, w, h) + 6; // 언덕 곡선을 따라 살짝 파묻힌 바닥선
      // 줄기 이동 (부드럽게 따라감)
      s.x = clamp(s.x + (s.tx - s.x) * Math.min(1, dt * 40), capW / 2, w - capW / 2); // 거의 즉시 따라감
      const stemTop = groundAt(s.x) - stemH;
      // 갓 생성 — 슬롯 수만큼만. 뒤로 갈수록 자주, 빠르게, 옆으로 흔들리며
      if (s.dropped < N_CAPS) {
        s.spawn -= dt;
        if (s.spawn <= 0) {
          const drift = s.t > 0.35 ? rand(-1, 1) * lerp(0, 70, (s.t - 0.35) / 0.65) : 0;
          s.caps.push({ id: s.nextId++, x: rand(capW / 2 + 8, w - capW / 2 - 8), y: -capH - 10, vy: lerp(170, 340, s.t) * (desktop ? 1.25 : 1), vx: drift, rot: rand(-14, 14), spin: rand(-30, 30) });
          s.dropped += 1;
          s.interval = lerp(1.4, 0.7, s.dropped / N_CAPS); s.spawn = s.interval;
        }
      }
      // 하루의 흐름 = 떨어진 갓 수 (마지막 갓이 떨어지는 순간 밤)
      s.t = clamp((s.dropped - (s.dropped < N_CAPS ? s.spawn / s.interval : 0)) / (N_CAPS - 1), 0, 1);
      // 갓 낙하 / 받기 / 놓치기
      const keep = [];
      for (const c of s.caps) {
        c.y += c.vy * dt; c.x += c.vx * dt; c.rot += c.spin * dt;
        if (c.x < capW / 2) { c.x = capW / 2; c.vx = Math.abs(c.vx); }
        if (c.x > w - capW / 2) { c.x = w - capW / 2; c.vx = -Math.abs(c.vx); }
        const bottom = c.y + capH;
        // 받기 판정: 갓 박스가 줄기 윗부분(머리~절반)과 겹치면 성공. 가장자리끼리 닿아도 인정
        const touchX = Math.abs(c.x - s.x) <= capW * 0.5 + stemW * 0.35;
        const touchY = bottom >= stemTop - 4 && c.y <= stemTop + stemH * 0.55;
        if (touchX && touchY) {
          // 받았다 → 잠깐 줄기 위에 얹혀 보였다가 언덕에 심긴다
          s.hold = 0.42; s.pending = (s.pending || 0) + 1; playCapCatch();
          continue;
        }
        const groundY = groundAt(c.x);
        if (bottom >= groundY + 8) {
          s.missed += 1; playCapMiss();
          for (let i = 0; i < 7; i++) s.crumbs.push({ id: s.nextId++, x: c.x + rand(-10, 10), y: groundY + rand(-4, 4), vx: rand(-90, 90), vy: rand(-220, -60), life: rand(0.5, 0.8), size: rand(4, 9) });
          continue;
        }
        keep.push(c);
      }
      s.caps = keep;
      if (s.hold > 0) {
        s.hold -= dt;
        if (s.hold <= 0) {
          while (s.pending > 0) { s.planted.push({ id: s.nextId++, slot: s.order[s.planted.length] }); s.pending -= 1; }
        }
      }
      // 부스러기
      for (const p of s.crumbs) { p.life -= dt; p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      s.crumbs = s.crumbs.filter((p) => p.life > 0);
      setFrame((f) => f + 1);
      if (s.dropped >= N_CAPS && s.caps.length === 0 && s.hold <= 0) { s.crumbs = []; setPhase("done"); playClear(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const t = s.t;
  const DUSK = 0.58; // 이 시각까지 노을, 그 뒤로 밤
  const skyTop = t < DUSK ? mix(M.sky, M.dusk, t / DUSK) : mix(M.dusk, M.night, (t - DUSK) / (1 - DUSK));
  const skyBot = t < DUSK ? mix("#FFF0A8", "#FFB98A", t / DUSK) : mix("#FFB98A", "#5B4A8A", (t - DUSK) / (1 - DUSK));
  const skyBg = `linear-gradient(180deg, ${skyTop}, ${skyBot})`;
  const nightAmt = clamp((t - DUSK) / (1 - DUSK), 0, 1); // 별·달·언덕 어두워짐
  const { w: W, h: H } = measure();
  const groundY = H * (1 - HILL) + 6; // 해·달 궤도의 지평선 기준
  const stemGround = hillTopAt(s.x, W, H) + 6;
  const stemTop = stemGround - stemH;
  const slope = (hillTopAt(s.x + 10, W, H) - hillTopAt(s.x - 10, W, H)) / 20; // 경사 → 줄기를 살짝 기울임
  const stemTilt = Math.atan(slope) * 180 / Math.PI * 0.7;
  const sunSize = desktop ? 96 : 70;
  const SUNSET = 0.72, sunT = clamp(t / SUNSET, 0, 1);
  const sunX = lerp(0.08, 0.92, sunT) * W - sunSize / 2;
  const sunY = groundY - Math.sin(Math.PI * sunT) * (groundY - sunSize * 0.6) - sunSize / 2; // 지평선에서 떠서 지평선으로
  const sunFade = 1 - clamp((t - 0.62) / 0.1, 0, 1);
  const moonT = clamp((t - 0.66) / 0.34, 0, 1);
  const moonY = groundY - Math.sin(Math.PI * moonT * 0.5) * (groundY * 0.78) - sunSize / 2;
  const planted = s.planted.length;

  const title = (
    <div>
      <h1 style={{ fontFamily: F.disp, fontSize: desktop ? "clamp(40px, 3.6vw, 56px)" : "clamp(26px, 6vw, 36px)", lineHeight: 1.05, margin: 0, color: M.choco, textShadow: `3px 3px 0 ${M.stem}` }}>きのこ{desktop ? <br /> : " "}キャッチ</h1>
      <div style={{ marginTop: desktop ? 16 : 2, fontSize: desktop ? 13 : 11, fontWeight: 700, letterSpacing: ".18em", color: M.choco, opacity: .75 }}>초코 버섯 받기</div>
      {desktop && <p style={{ margin: "34px 0 0", maxWidth: 340, fontSize: "clamp(13px, 1.1vw, 15.5px)", lineHeight: 1.9, fontWeight: 700, wordBreak: "keep-all" }}>초콜릿 갓을 비스킷 줄기로 받아보세요!<br />받을 때마다 버섯이 언덕에 심겨요.<br />밤이 될때까지 언덕을 가득 채워보세요!</p>}
    </div>
  );
  const score = (
    <div style={{ textAlign: desktop ? "left" : "right" }}>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 60 : 44, color: M.choco, lineHeight: 1 }}>{planted}<span style={{ fontSize: desktop ? 22 : 16, marginLeft: 6 }}>/ {N_CAPS}</span></div>
      <div style={{ fontSize: desktop ? 15 : 12, fontWeight: 700, letterSpacing: ".1em", marginTop: desktop ? 4 : 0 }}>심은 버섯 · 놓침 {s.missed}</div>
    </div>
  );
  const dayBar = (
    <div style={{ marginTop: desktop ? 14 : 0, maxWidth: desktop ? 320 : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: desktop ? 13 : 11, fontWeight: 700 }}><span>☀ あさ</span><span>よる ☾</span></div>
      <div style={{ position: "relative", height: 8, marginTop: desktop ? 8 : 4, borderRadius: 99, background: `linear-gradient(90deg, ${M.sky}, ${M.dusk}, ${M.night})` }}>
        <div style={{ position: "absolute", top: -4, left: `calc(${t * 100}% - 8px)`, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: `3px solid ${M.choco}` }} />
      </div>
    </div>
  );

  const sky = (
    <>
      {/* 별 — 해질녘부터 서서히 */}
      {stars.map((st) => <div key={st.id} style={{ position: "absolute", left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, borderRadius: "50%", background: "#FFF8D6", opacity: nightAmt * (0.55 + 0.45 * Math.sin((performance.now() / 600) + st.d)), boxShadow: "0 0 6px #FFF8D6" }} />)}
      {/* 해 */}
      <div style={{ position: "absolute", left: sunX, top: sunY, width: sunSize, height: sunSize, borderRadius: "50%", background: t > 0.4 ? "#FFB347" : "#FFF07A", boxShadow: t > 0.4 ? "0 0 50px #FF9E4A99" : "0 0 60px #FFE24A", opacity: sunFade }} />
      {/* 달 */}
      <div style={{ position: "absolute", left: `${lerp(6, 18, moonT)}%`, top: moonY, width: sunSize * 0.7, height: sunSize * 0.7, borderRadius: "50%", background: "#FFF6CC", boxShadow: `inset ${-sunSize * 0.16}px ${-sunSize * 0.08}px 0 ${mix("#2C2A5E", "#5B4A8A", 0.4)}, 0 0 40px #FFF6CC66`, opacity: clamp(moonT * 2, 0, 1) }} />
    </>
  );

  const hill = (
    <div style={{ position: "absolute", left: "-10%", right: "-10%", bottom: 0, height: `${HILL * 100}%`, background: `radial-gradient(ellipse at 50% 100%, ${M.grass}, ${M.grassDeep})`, borderRadius: "50% 50% 0 0 / 30% 30% 0 0", zIndex: 1 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: "#141438", opacity: nightAmt * 0.45 }} />
      {/* 심은 버섯들 — 고정 슬롯에 채워짐. 언덕 div 가 화면보다 20% 넓게(-10%~) 깔려 있어서 화면 % → 언덕 % 로 환산 */}
      {s.planted.map((m) => {
        const sl = HILL_SLOTS[m.slot];
        const scale = sl.sc * (desktop ? 1 : 0.85);
        return (
          <div key={m.id} style={{ position: "absolute", left: `${(sl.x + 10) / 1.2}%`, bottom: `${sl.y}%`, width: capW * scale, marginLeft: -capW * scale / 2, transformOrigin: "bottom center", animation: `sprout .55s cubic-bezier(.2,.9,.3,1.3) both`, zIndex: sl.z }}>
            <BiscuitStem w={stemW * scale} style={{ margin: "0 auto", marginTop: (capH - OVERLAP) * scale }} />
            <ChocoCap w={capW * scale} style={{ position: "absolute", left: 0, top: 0 }} />
          </div>
        );
      })}
    </div>
  );

  const player = phase !== "ready" && (
    <div style={{ position: "absolute", left: s.x - stemW / 2, top: stemTop, width: stemW, zIndex: 2, pointerEvents: "none", transform: `rotate(${stemTilt}deg)`, transformOrigin: "bottom center" }}>
      <BiscuitStem w={stemW} />
      {s.hold > 0 && <ChocoCap w={capW} style={{ position: "absolute", left: (stemW - capW) / 2, top: -(capH - OVERLAP), animation: "openPopL .3s ease-out both" }} />}
    </div>
  );
  const falling = s.caps.map((c) => <div key={c.id} style={{ position: "absolute", left: c.x - capW / 2, top: c.y, transform: `rotate(${c.rot}deg)`, zIndex: 3, filter: "drop-shadow(0 6px 6px rgba(0,0,0,.25))" }}><ChocoCap w={capW} /></div>);
  const crumbs = s.crumbs.map((p) => <div key={p.id} style={{ position: "absolute", left: p.x, top: p.y, width: p.size, height: p.size, borderRadius: "40%", background: M.choco, opacity: clamp(p.life * 2, 0, 1), zIndex: 3 }} />);

  const overlayWrap = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: `${HILL * 60}%`, zIndex: 5, pointerEvents: "none" };
  const overlayCard = { textAlign: "center", background: "rgba(255,243,214,.95)", border: `4px solid ${M.choco}`, borderRadius: 22, padding: desktop ? "30px 44px" : "22px 28px", boxShadow: "0 10px 0 #2A1508", animation: "fadeIn .35s both", minWidth: desktop ? 340 : 250, pointerEvents: "auto" };
  const bigBtn = { marginTop: 18, background: M.choco, color: M.stem, boxShadow: "0 5px 0 #2A1508", fontSize: desktop ? 19 : 16, padding: desktop ? "14px 30px" : "11px 22px" };
  const ready = phase === "ready" && (
    <div style={overlayWrap}><div style={overlayCard}>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 30 : 24, color: M.choco }}>きのこキャッチ</div>
      <div style={{ marginTop: 10, fontSize: desktop ? 15 : 13, fontWeight: 700, color: M.ink, lineHeight: 1.6 }}>{desktop ? "마우스를 좌우로 움직여" : "화면을 좌우로 문질러"} 초콜릿을 받으세요</div>
      <button className="btn" onClick={start} style={bigBtn}>시작하기</button>
    </div></div>
  );
  const done = phase === "done" && (
    <div style={overlayWrap}><div style={overlayCard}>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 30 : 24, color: M.choco }}>{planted === N_CAPS ? "きのこ いっぱい！" : "よるに なりました"}</div>
      <div style={{ fontSize: desktop ? 13 : 12, fontWeight: 700, color: M.ink, opacity: .7, marginTop: 2 }}>{planted === N_CAPS ? "언덕이 버섯으로 가득 찼어요!" : "밤이 되었어요"}</div>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 68 : 52, color: M.choco, lineHeight: 1.1, marginTop: 10 }}>{planted}<span style={{ fontSize: desktop ? 24 : 18, marginLeft: 6 }}>개</span></div>
      <div style={{ fontSize: desktop ? 16 : 13, fontWeight: 700, color: M.ink, marginTop: desktop ? 14 : 10 }}>버섯을 심었어요 · 놓친 갓 {s.missed}개</div>
      <button className="btn" onClick={start} style={bigBtn}>다시 하기</button>
    </div></div>
  );

  const field = (
    <section ref={areaRef} onPointerMove={onPointer} onPointerDown={onPointer} style={{ position: "relative", overflow: "hidden", background: skyBg, touchAction: "none", cursor: phase === "play" ? "none" : "default", flex: 1, minHeight: 0 }}>
      {sky}
      {hill}
      {player}
      {falling}
      {crumbs}
      {ready}
      {done}
    </section>
  );

  if (desktop) {
    return (
      <div className="scene" style={{ height: "100vh", display: "grid", gridTemplateColumns: GAME_COLS, background: M.stem, color: M.ink, overflow: "hidden" }}>
        <SidePanel bg={M.stem} border={M.choco} color={M.ink}>
          <TopBar onBack={onBack} />
          <div style={{ ...PANEL_BODY, paddingLeft: 40 }}>
            <div style={{ ...PANEL_GROUP, margin: "7vh 0 auto" }}>
              {title}
              {score}
              {dayBar}
            </div>
          </div>
        </SidePanel>
        {field}
      </div>
    );
  }
  return (
    <div className="scene" style={{ height: "100vh", display: "flex", flexDirection: "column", background: skyBg, color: M.ink, position: "relative", overflow: "hidden" }}>
      {/* 모바일 상단 패널 — 밤하늘 위에서도 글자가 읽히도록 데스크톱과 같은 크림색 배경 */}
      <div style={{ background: M.stem, borderBottom: `4px solid ${M.choco}`, position: "relative", zIndex: 2, flexShrink: 0 }}>
        <TopBar onBack={onBack} />
        <header style={{ position: "relative", padding: "8px 24px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          {title}
          {score}
        </header>
        <div style={{ padding: "0 24px 12px" }}>{dayBar}</div>
      </div>
      {field}
    </div>
  );
}

// hex mix helper
function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const c = (x, y) => Math.round(x + (y - x) * Math.min(1, Math.max(0, t)));
  return `rgb(${c(r1, r2)},${c(g1, g2)},${c(b1, b2)})`;
}

// ═════════════════════════════════════════════════════════════
// SCENE 4 · ANIMAL BISCUIT QUIZ
// ═════════════════════════════════════════════════════════════
const A = { pink: "#F04E7C", pinkDeep: "#B8244F", biscuit: "#EAC27A", biscuitDeep: "#C79A4C", yellow: "#FFF07A", ink: "#3A1A2A" };

const ANIMALS = [
  { name: "ELEPHANT", ko: "코끼리", img: BIS_ELEPHANT },
  { name: "RABBIT", ko: "토끼", img: BIS_RABBIT },
  { name: "DUCK", ko: "오리", img: BIS_DUCK },
  { name: "CAT", ko: "고양이", img: BIS_CAT },
  { name: "FISH", ko: "물고기", img: BIS_FISH },
  { name: "TURTLE", ko: "거북이", img: BIS_TURTLE },
];

function AnimalsScene({ onBack }) {
  const [order, setOrder] = useState(() => ANIMALS.map((_, i) => i).sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState("ask"); // ask | right | wrong | done
  const [score, setScore] = useState(0);
  const [wrongPick, setWrongPick] = useState(null);
  const current = ANIMALS[order[idx]];
  const options = useMemo(() => {
    const others = ANIMALS.filter((a) => a !== current).sort(() => Math.random() - 0.5).slice(0, 2);
    return [current, ...others].sort(() => Math.random() - 0.5);
  }, [idx, order]);

  function pick(a) {
    if (status !== "ask") return;
    if (a === current) {
      setStatus("right"); setScore((s) => s + 1); playRight();
      setTimeout(() => {
        if (idx + 1 >= order.length) { setStatus("done"); playClear(); } // 여섯 마리 다 맞히면 축하 멜로디
        else { setIdx((i) => i + 1); setStatus("ask"); }
      }, 1000);
    } else {
      setWrongPick(a.name); setStatus("wrong"); playWrong();
      setTimeout(() => { setStatus("ask"); setWrongPick(null); }, 500);
    }
  }
  function restart() { setOrder(ANIMALS.map((_, i) => i).sort(() => Math.random() - 0.5)); setIdx(0); setScore(0); setStatus("ask"); }

  const revealed = status === "right" || status === "done";

  const desktop = useDesktop();
  const title = (
    <div>
      <h1 style={{ fontFamily: F.disp, fontSize: desktop ? "clamp(40px, 3.6vw, 56px)" : "clamp(34px, 7vw, 64px)", lineHeight: 1.05, margin: 0, color: A.yellow, textShadow: `3px 3px 0 ${A.pinkDeep}` }}>どうぶつ<br />だあれ？</h1>
      <div style={{ marginTop: desktop ? 16 : 8, fontSize: 13, fontWeight: 700, letterSpacing: ".18em", color: "rgba(255,255,255,.75)" }}>어떤 동물일까?</div>
      <p style={{ margin: desktop ? "34px 0 0" : "10px 0 0", maxWidth: 320, fontSize: desktop ? 17 : 14, lineHeight: desktop ? 1.85 : 1.6, fontWeight: 700, wordBreak: "keep-all" }}>그림자를 보고 동물을 맞혀 보세요!<br />잡고 돌려 보며 살펴본 뒤 정답을 골라주세요. 맞히면 정체가 공개돼요!</p>
    </div>
  );
  const scoreBox = (
    <div style={{ textAlign: desktop ? "left" : "right" }}>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 60 : 44, color: A.yellow, lineHeight: 1 }}>{score}<span style={{ fontSize: desktop ? 24 : 18 }}>/{ANIMALS.length}</span></div>
      <div style={{ fontSize: desktop ? 15 : 12, fontWeight: 700, letterSpacing: ".1em", marginTop: desktop ? 4 : 0 }}>맞힌 비스킷</div>
    </div>
  );
  const dots = <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#fff3 2px, transparent 2.5px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />;
  const bg = `radial-gradient(circle at 20% 10%, #FF7FA3, ${A.pink} 40%, ${A.pinkDeep})`;
  const bisSize = desktop ? 320 : 220;
  const quiz = status === "done" ? (
    <div style={{ animation: "fadeIn .4s both" }}>
      <div style={{ fontFamily: F.disp, fontSize: desktop ? 40 : 30, color: A.yellow }}>ぜんぶ せいかい！</div>
      <div style={{ marginTop: 6, fontSize: desktop ? 15 : 13, fontWeight: 700, letterSpacing: ".16em", color: "rgba(255,255,255,.85)" }}>전부 정답!</div>
      <div style={{ display: "flex", justifyContent: "center", gap: desktop ? 14 : 8, margin: "18px 0", flexWrap: "wrap" }}>
        {ANIMALS.map((a) => <Biscuit key={a.name} animal={a} revealed size={desktop ? 110 : 72} />)}
      </div>
      <button className="btn" onClick={restart} style={{ background: A.yellow, color: A.ink, boxShadow: `0 5px 0 ${A.pinkDeep}`, fontFamily: F.disp, fontSize: desktop ? 18 : 17, padding: desktop ? "8px 36px" : "12px 28px", marginTop: desktop ? 10 : 0 }}>다시하기</button>
    </div>
  ) : (
    <>
      <div key={idx} style={{ display: "inline-block", animation: status === "wrong" ? "shakeX .4s" : "fadeIn .35s both" }}>
        <Biscuit animal={current} revealed={revealed} size={bisSize} />
      </div>
      <div style={{ display: "grid", gap: desktop ? 14 : 10, marginTop: desktop ? 30 : 22, gridTemplateColumns: desktop ? "repeat(3, minmax(150px, 210px))" : "1fr", justifyContent: "center" }}>
        {options.map((a) => {
          const isRight = revealed && a === current;
          const isWrong = wrongPick === a.name;
          return (
            <button key={a.name} className="btn" data-silent onClick={() => pick(a)} style={{ background: isRight ? A.yellow : isWrong ? A.pinkDeep : "#fff", color: isRight ? A.ink : isWrong ? "#fff" : A.pinkDeep, fontFamily: F.disp, fontSize: 18, letterSpacing: ".12em", padding: "14px", boxShadow: `0 4px 0 ${A.pinkDeep}`, whiteSpace: "nowrap", alignSelf: "start" }}>
              {a.name}{isRight && <span style={{ display: "block", fontFamily: F.body, fontSize: 12, letterSpacing: 0, marginTop: 2, wordBreak: "keep-all", whiteSpace: "nowrap" }}>{a.ko}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: desktop ? 26 : 16, fontFamily: F.disp, fontSize: desktop ? 26 : 20, letterSpacing: ".14em", color: A.yellow, textShadow: `2px 2px 0 ${A.pinkDeep}` }}>{idx + 1} / {ANIMALS.length}</div>
    </>
  );

  if (desktop) {
    return (
      <div className="scene" style={{ height: "100vh", display: "grid", gridTemplateColumns: GAME_COLS, background: bg, color: "#fff", overflow: "hidden" }}>
        <SidePanel bg={A.pinkDeep} border={A.yellow} color="#fff">
          <TopBar index="02" title="たべっ子どうぶつ" color={A.pinkDeep} labelColor="#FFD1DE" onBack={onBack} />
          <div style={{ ...PANEL_BODY, paddingLeft: 40 }}>
            <div style={{ ...PANEL_GROUP, margin: "7vh 0 auto" }}>
              {title}
              {scoreBox}
              {/* 진행 상황 — 출제 순서대로 비스킷이 구워진다 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, justifyItems: "center", width: "100%", maxWidth: 340, alignSelf: "center", marginTop: 14 }}>
                {order.map((ai, i) => {
                  const baked = i < score;
                  const now = i === idx && status !== "done";
                  return (
                    <div key={ai} style={{ width: "100%", aspectRatio: "1", maxWidth: 96, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: now ? "rgba(255,255,255,.14)" : "transparent", boxShadow: now ? `inset 0 0 0 2px ${A.yellow}` : "none", transition: "background .3s, box-shadow .3s" }}>
                      <img src={ANIMALS[ai].img} alt={baked ? ANIMALS[ai].name : ""} draggable={false} style={{ width: "80%", height: "80%", objectFit: "contain", filter: baked ? "drop-shadow(0 2px 0 rgba(0,0,0,.25))" : "brightness(0)", opacity: baked ? 1 : 0.45, transform: baked ? "scale(1)" : "scale(.88)", transition: "filter .5s, opacity .5s, transform .4s cubic-bezier(.3,1.4,.5,1)" }} />
            </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SidePanel>
        <section style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          {dots}
          <main style={{ position: "relative", width: "100%", maxWidth: 760, textAlign: "center" }}>{quiz}</main>
        </section>
      </div>
    );
  }
  return (
    <div className="scene" style={{ minHeight: "100vh", background: bg, color: "#fff", position: "relative", overflow: "hidden" }}>
      {dots}
      <TopBar index="02" color={A.pinkDeep} onBack={onBack} />
      <header style={{ position: "relative", padding: "12px 24px 0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        {title}
        {scoreBox}
      </header>
      <main style={{ position: "relative", maxWidth: 520, margin: "28px auto 0", padding: "0 24px 48px", textAlign: "center" }}>{quiz}</main>
    </div>
  );
}

// 2D PNG로 3D 느낌 내기: 포인터 위치 따라 틸트(rotateX/Y) + 같은 실루엣을 translateZ로 겹쳐 쌓아 두께 표현.
// 실루엣 모드는 filter: brightness(0)로 검게, 정답이면 원본 색으로 돌아오며 한 바퀴 돈다.
const BIS_DEPTH = 7; // 두께 레이어 수
function Biscuit({ animal, revealed, size }) {
  const [tilt, setTilt] = useState(null); // null = 자동 흔들림, {x,y} = 손으로 잡는 중
  const [baking, setBaking] = useState(false);
  const wasRevealed = useRef(revealed);
  const boxRef = useRef(null);

  // 방금 정답이 됐을 때만 굽기(회전) 연출
  useEffect(() => {
    const justBaked = revealed && !wasRevealed.current;
    wasRevealed.current = revealed;
    if (justBaked) { setBaking(true); const t = setTimeout(() => setBaking(false), 950); return () => clearTimeout(t); }
  }, [revealed]);

  function onMove(e) {
    const r = boxRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 ~ 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 40, y: px * 40 });                // 최대 ±20deg
  }
  function onLeave() { setTilt(null); }

  const depthColor = revealed ? A.biscuitDeep : "#8A1A3D";
  const layerStep = Math.max(1, size / 110); // 크기에 비례한 두께
  const bodyClass = "bisBody" + (baking ? " bake" : tilt ? "" : " idle");
  const bodyStyle = tilt ? { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: "transform .08s" } : { transition: "transform .5s cubic-bezier(.2,.9,.3,1.2)" };

  return (
    <div ref={boxRef} className="bis" onPointerMove={onMove} onPointerLeave={onLeave} onPointerCancel={onLeave}
      style={{ width: size, height: size, perspective: size * 3.2, filter: revealed ? "drop-shadow(0 14px 10px rgba(0,0,0,.25))" : "drop-shadow(0 12px 8px rgba(0,0,0,.35))" }}>
      <div className={bodyClass} style={bodyStyle}>
        {Array.from({ length: BIS_DEPTH }, (_, i) => (
          <div key={i} className="bisLayer" style={{ background: depthColor, WebkitMaskImage: `url(${animal.img})`, maskImage: `url(${animal.img})`, transform: `translateZ(${-(i + 1) * layerStep}px)` }} />
        ))}
        <img className="bisFace" src={animal.img} alt={revealed ? animal.name : "비스킷 그림자"} draggable={false} style={{ filter: revealed ? "none" : "brightness(0)" }} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SCENE 0 · ENTRANCE (편의점 입구 — 문을 누르면 벨 + BGM과 함께 입장)
// 실제 편의점 정면처럼: 벽돌 처마 → 초록 띠 → 흰 간판 → 파란 선 → 유리창(위)·초록 패널(아래) → 보도 타일
// ═════════════════════════════════════════════════════════════
const ST = { navy: "#1F3D8C", frame: "#A9B4BA", frameDark: "#7E8A90", brick: "#B6AA98", mortar: "#D3CBBF", panel: "#00A040", glass: "rgba(190,215,228,.22)" };
const BRICK = { background: `repeating-linear-gradient(0deg, ${ST.brick} 0 6px, ${ST.mortar} 6px 7px), repeating-linear-gradient(90deg, transparent 0 13px, ${ST.mortar}66 13px 14px)` };

// 유리창 너머 매장 내부 — 흰 벽·천장 조명·빈 진열대 (과자는 보이지 않는다). 문이 열리면 밝아진다
function Interior({ lit, shelves = 2 }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #F7F9FA 0 22%, #E9EEF0 22% 88%, #D9DFE2 88%)", filter: lit ? "brightness(1)" : "brightness(.9)", transition: "filter 1.1s", overflow: "hidden" }}>
      {/* 천장 매입등 두 줄 */}
      {[7, 15].map((y) => (
        <div key={y} style={{ position: "absolute", top: `${y}%`, left: "6%", right: "6%", height: 5, borderRadius: 3, background: "#fff", boxShadow: lit ? "0 0 18px 6px rgba(255,255,255,.9)" : "0 0 8px 2px rgba(255,255,255,.5)", transition: "box-shadow 1.1s" }} />
      ))}
      {/* 벽과 바닥의 경계 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "88%", height: 2, background: "#C7CFD3" }} />
      {/* 빈 진열대 — 회색 철제, 선반 세 단 */}
      {Array.from({ length: shelves }, (_, i) => (
        <div key={i} style={{ position: "absolute", bottom: "12%", left: shelves === 1 ? "50%" : `${14 + i * (72 / (shelves - 1))}%`, transform: "translateX(-50%)", width: "26%", maxWidth: 220, height: "34%", maxHeight: 150, background: "repeating-linear-gradient(90deg, #C3CBCF 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, #C3CBCF 0 1px, transparent 1px 6px), #DCE2E5", border: "2px solid #AEB8BD", borderRadius: 2, boxShadow: "0 3px 0 #9FA9AE" }}>
          {[30, 62, 94].map((t) => <div key={t} style={{ position: "absolute", left: -2, right: -2, top: `${t}%`, height: 4, background: "#B6C0C5", boxShadow: "0 2px 0 #97A2A8" }} />)}
        </div>
      ))}
    </div>
  );
}

// 유리 반사 — 하늘이 비친 옅은 하이라이트
const GLASS_REFLECT = { position: "absolute", inset: 0, background: "linear-gradient(112deg, rgba(255,255,255,.34) 0 14%, rgba(205,225,236,.18) 14% 34%, rgba(255,255,255,.12) 34% 48%, rgba(180,205,220,.16) 48%)", pointerEvents: "none" };

// 유리창 한 짝 — 위 2/3 유리, 아래 1/3 초록 패널(흰 줄·파란 줄)
function StoreWindow({ lit, shelves = 2 }) {
  return (
    <div style={{ position: "relative", height: "100%", border: `7px solid ${ST.frame}`, borderBottom: 0, background: ST.frameDark, overflow: "hidden", minWidth: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "66%", overflow: "hidden" }}>
        <Interior lit={lit} shelves={shelves} />
        <div style={GLASS_REFLECT} />
      </div>
      {/* 초록 패널 */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", background: ST.panel, boxShadow: "inset 0 7px 0 #fff, inset 0 11px 0 " + FM.blue }} />
      {/* 세로 멀리언 */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 7, marginLeft: -3, background: ST.frame }} />
    </div>
  );
}

// 자동문 한 짝 — 초록 테두리 유리문. 열리면 각자 바깥쪽으로 미끄러진다
function DoorPanel({ side, opened, vertical, sticker }) {
  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, [side]: 0, width: "50%", border: `8px solid ${ST.panel}`, boxShadow: "inset 0 0 0 2px #0B7A33", background: ST.glass, transform: opened ? `translateX(${side === "left" ? "-100%" : "100%"})` : "none", transition: "transform 1.5s cubic-bezier(.65,0,.35,1)", overflow: "hidden" }}>
      <div style={GLASS_REFLECT} />
      {/* 세로 로고 — 오른쪽 문 유리에 초록 글자 */}
      {vertical && side === "right" && (
        <div style={{ position: "absolute", top: "7%", left: 16, writingMode: "vertical-rl", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: "clamp(26px, 2.5vw, 38px)", color: FM.green, letterSpacing: ".16em", textShadow: "0 1px 0 rgba(255,255,255,.8)" }}>おかしコンビニ</div>
      )}
      {/* 「営業中」 팻말 — 왼쪽 문 유리에 흡착 고리로 매달려 살짝 흔들린다 */}
      {sticker && side === "left" && (
        <div style={{ position: "absolute", left: "50%", top: "10%", width: 0, height: 0, zIndex: 2 }}>
          <div style={{ position: "absolute", left: -7, top: -7, width: 14, height: 14, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #F4F7F6, #9AA5A1)", boxShadow: "0 1px 2px rgba(0,0,0,.35)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", animation: opened ? "none" : "swing 3.2s ease-in-out infinite" }}>
            {/* 끈 */}
            <div style={{ position: "absolute", left: -1, top: 4, width: 2, height: 30, background: "#8A7A5A" }} />
            {/* 팻말 */}
            <div style={{ position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)", width: "max(96px, min(150px, 9vw))", background: "#FFFDF6", border: "3px solid #2B2B2B", borderRadius: 6, padding: "9px 8px 8px", textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 3px 6px rgba(0,0,0,.25)" }}>
              <div style={{ fontWeight: 900, fontSize: "clamp(20px, 2vw, 30px)", lineHeight: 1, color: "#D0021B", letterSpacing: ".04em", whiteSpace: "nowrap" }}>営業中</div>
              <div style={{ marginTop: 6, paddingTop: 5, borderTop: "2px solid #2B2B2B", fontWeight: 900, fontSize: "clamp(10px, .95vw, 13px)", color: FM.blue, letterSpacing: ".18em", whiteSpace: "nowrap" }}>24時間</div>
            </div>
          </div>
        </div>
      )}
      {/* 긴 손잡이 */}
      <div style={{ position: "absolute", top: "36%", bottom: "38%", [side === "left" ? "right" : "left"]: 12, width: 9, borderRadius: 5, background: "linear-gradient(90deg, #8F9A96, #F2F5F4 45%, #8F9A96)", boxShadow: "0 1px 3px rgba(0,0,0,.35)" }} />
    </div>
  );
}

function Entrance({ onEnter }) {
  const [opened, setOpened] = useState(false);
  const desktop = useMedia("(min-width: 900px)");
  function enter() {
    if (opened) return;
    setOpened(true);
    playChimeThenBgm();
    setTimeout(onEnter, 1200); // 문이 거의 열렸을 때 선반으로 전환
  }

  // 처마·간판: 벽돌 → 초록 띠 → 흰 간판(로고) → 파란 선 → 벽돌
  const fascia = (
    <div style={{ flexShrink: 0, position: "relative", zIndex: 2, boxShadow: "0 6px 14px rgba(0,0,0,.18)" }}>
      <div style={{ height: desktop ? 16 : 10, ...BRICK }} />
      <div style={{ height: desktop ? 34 : 18, background: FM.green }} />
      <div style={{ height: desktop ? 112 : 64, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: desktop ? 16 : 9 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ width: desktop ? 60 : 34, height: desktop ? 24 : 13, background: FM.green, borderRadius: 3 }} />
          <div style={{ width: desktop ? 60 : 34, height: desktop ? 24 : 13, background: FM.blue, borderRadius: 3 }} />
        </div>
        <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: desktop ? "clamp(40px, 4.6vw, 66px)" : "clamp(24px, 8vw, 36px)", color: ST.navy, letterSpacing: "-.01em", lineHeight: 1 }}>おかしコンビニ</div>
      </div>
      <div style={{ height: desktop ? 8 : 5, background: FM.blue }} />
      <div style={{ height: desktop ? 12 : 8, ...BRICK }} />
    </div>
  );

  // 자동문 구역 — 위쪽 유리 트랜섬 + 두 짝의 문. 문 뒤로 매장 내부가 보인다
  const door = (
    <div onClick={enter} role="button" data-silent aria-label="편의점 입장" style={{ position: "relative", height: "100%", border: `7px solid ${ST.frame}`, borderBottom: 0, background: ST.frameDark, overflow: "hidden", cursor: opened ? "default" : "pointer" }}>
      <Interior lit={opened} shelves={0} />
      {/* 트랜섬(문 위 고정 유리) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "17%", borderBottom: `7px solid ${ST.frame}`, overflow: "hidden" }}><div style={GLASS_REFLECT} /></div>
      {/* 문 두 짝 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "17%", bottom: 0, overflow: "hidden" }}>
        <DoorPanel side="left" opened={opened} sticker />
        <DoorPanel side="right" opened={opened} vertical />
      </div>
    </div>
  );

  // 보도 — 킥플레이트 + 밝은 회색 타일
  const sidewalk = (h) => (
    <div style={{ position: "relative", zIndex: 3, height: h, flexShrink: 0, background: "#DDE3E0", backgroundImage: "linear-gradient(180deg, #8F9A96 0 9px, #C9D1CE 9px 12px, transparent 12px), linear-gradient(90deg, rgba(0,0,0,.07) 1px, transparent 1px), linear-gradient(180deg, rgba(0,0,0,.07) 1px, transparent 1px)", backgroundSize: "100% 100%, 64px 64px, 64px 64px", boxShadow: "inset 0 12px 16px -10px rgba(0,0,0,.28)" }} />
  );

  return (
    <div className="scene" style={{ height: "100vh", background: "linear-gradient(180deg, #CFE4F5, #EAF3FA)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* 하늘 */}
      <div style={{ flex: `0 0 ${desktop ? "9vh" : "6vh"}` }} />
      {fascia}
      {/* 정면: [유리창 | 자동문 | 유리창] — 모바일은 양옆 창이 좁게만 보인다 */}
      <div style={{ flex: 1, minHeight: 0, position: "relative", background: "#B4BEC3", padding: 0, display: "grid", gridTemplateColumns: desktop ? "1fr clamp(380px, 30vw, 540px) 1fr" : "12% 1fr 12%", columnGap: desktop ? 10 : 6, alignItems: "stretch" }}>
        <StoreWindow lit={opened} shelves={0} />
        {door}
        <StoreWindow lit={opened} shelves={0} />
      </div>
      {sidewalk(desktop ? "13vh" : "8vh")}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════
export default function SnackCorner() {
  const [scene, setScene] = useState(() => new URLSearchParams(window.location.search).get("scene") || "entrance"); // ?scene=shelf 로 바로 진입 (개발용)
  const back = () => setScene("shelf");
  // 모든 버튼에 공용 클릭음 — 자기 효과음이 있는 버튼(data-silent)은 제외. 캡처 단계라 stopPropagation 과 무관하다
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest?.('button, [role="button"]');
      if (el && !el.disabled && !el.hasAttribute("data-silent")) playTick();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return (
    <div style={{ fontFamily: F.body }}>
      <style>{GLOBAL_CSS}</style>
      {scene === "entrance" && <Entrance onEnter={back} />}
      {scene === "shelf" && <Shelf onOpen={setScene} />}
      {scene === "potato" && <PotatoScene onBack={back} />}
      {scene === "mushroom" && <MushroomScene onBack={back} />}
      {scene === "animals" && <AnimalsScene onBack={back} />}
    </div>
  );
}
