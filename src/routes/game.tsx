import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Trophy, Play, RotateCcw, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import witchSprite from "@/assets/game-witch.png";
import pumpkinSprite from "@/assets/game-pumpkin.png";
import ghostSprite from "@/assets/game-ghost.png";
import brambleSprite from "@/assets/game-bramble.png";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Witch Run — Jogo da Bruxinha | Docelari" },
      {
        name: "description",
        content:
          "Jogue Witch Run: pule obstáculos com a bruxinha da Docelari, marque pontos e entre no ranking mágico.",
      },
    ],
  }),
  component: GamePage,
});

type Score = { id: string; player_name: string; score: number; created_at: string };

const GAME_W = 800;
const GAME_H = 280;
const GROUND_Y = 230;
const GRAVITY = 0.7;
const JUMP_V = -13;

type Obstacle = { x: number; w: number; h: number; type: 0 | 1 | 2; y: number };

function GamePage() {
  return (
    <div className="min-h-screen bg-mystic">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl text-deep flex items-center gap-2">
            <Home className="h-5 w-5" /> Docelari
          </Link>
          <h1 className="font-display text-xl sm:text-2xl text-deep">🧙‍♀️ Witch Run</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-2 sm:px-6 py-3 sm:py-10">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_320px]">
          <Game />
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}

function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Game refs
  const witchY = useRef(GROUND_Y);
  const witchVy = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const speed = useRef(6);
  const distance = useRef(0);
  const spawnTimer = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);
  const sprites = useRef<{ witch?: HTMLImageElement; pumpkin?: HTMLImageElement; ghost?: HTMLImageElement; bramble?: HTMLImageElement }>({});

  // Load sprites
  useEffect(() => {
    const load = (src: string) =>
      new Promise<HTMLImageElement>((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });
    Promise.all([load(witchSprite), load(pumpkinSprite), load(ghostSprite), load(brambleSprite)]).then(
      ([w, p, g, b]) => {
        sprites.current = { witch: w, pumpkin: p, ghost: g, bramble: b };
        draw();
      },
    );
    const stored = typeof window !== "undefined" ? localStorage.getItem("witchrun_best") : null;
    if (stored) setBest(parseInt(stored));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    witchY.current = GROUND_Y;
    witchVy.current = 0;
    obstacles.current = [];
    speed.current = 6;
    distance.current = 0;
    spawnTimer.current = 0;
    setScore(0);
    setSubmitted(false);
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current === "playing" && witchY.current >= GROUND_Y) {
      witchVy.current = JUMP_V;
    } else if (stateRef.current === "idle" || stateRef.current === "gameover") {
      reset();
      setState("playing");
    }
  }, [reset]);

  // Keyboard + touch
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    grad.addColorStop(0, "#2d1b4e");
    grad.addColorStop(1, "#5b3a8a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Stars
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 30; i++) {
      const x = (i * 73 + Math.floor(distance.current * 0.2)) % GAME_W;
      const y = (i * 31) % (GROUND_Y - 40);
      ctx.fillRect(x, y, 2, 2);
    }

    // Moon
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(680, 60, 28, 0, Math.PI * 2);
    ctx.fill();

    // Ground
    ctx.fillStyle = "#1a0d2e";
    ctx.fillRect(0, GROUND_Y + 40, GAME_W, GAME_H - GROUND_Y - 40);
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 40);
    ctx.lineTo(GAME_W, GROUND_Y + 40);
    ctx.stroke();

    // Witch
    const witchSize = 64;
    if (sprites.current.witch) {
      ctx.drawImage(sprites.current.witch, 60, witchY.current - witchSize + 40, witchSize, witchSize);
    }

    // Obstacles
    for (const o of obstacles.current) {
      let img: HTMLImageElement | undefined;
      if (o.type === 0) img = sprites.current.pumpkin;
      else if (o.type === 1) img = sprites.current.bramble;
      else img = sprites.current.ghost;
      if (img) ctx.drawImage(img, o.x, o.y, o.w, o.h);
    }

    // HUD score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`HI ${best.toString().padStart(5, "0")}  ${Math.floor(distance.current / 5).toString().padStart(5, "0")}`, GAME_W - 16, 30);

    if (state === "idle") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, GAME_W, GAME_H);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "bold 28px monospace";
      ctx.fillText("PRESSIONE ESPAÇO OU TOQUE PARA PULAR", GAME_W / 2, GAME_H / 2);
    }
  }, [best, state]);

  // Game loop
  useEffect(() => {
    if (state !== "playing") {
      draw();
      return;
    }
    const loop = (t: number) => {
      const dt = lastTime.current ? Math.min(33, t - lastTime.current) : 16;
      lastTime.current = t;

      // physics
      witchVy.current += GRAVITY;
      witchY.current += witchVy.current;
      if (witchY.current > GROUND_Y) {
        witchY.current = GROUND_Y;
        witchVy.current = 0;
      }

      distance.current += speed.current * (dt / 16);
      speed.current = Math.min(14, 6 + distance.current / 1500);

      // spawn
      spawnTimer.current -= dt;
      if (spawnTimer.current <= 0) {
        const type = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        let w = 44, h = 44, y = GROUND_Y - 4;
        if (type === 1) { w = 50; h = 60; y = GROUND_Y - 20; }
        if (type === 2) { w = 48; h = 48; y = GROUND_Y - 70 - Math.random() * 30; }
        obstacles.current.push({ x: GAME_W + 20, w, h, y, type });
        spawnTimer.current = 700 + Math.random() * 800 - Math.min(400, distance.current / 8);
      }

      // move + collide
      const witchBox = { x: 70, y: witchY.current - 24, w: 44, h: 56 };
      for (const o of obstacles.current) {
        o.x -= speed.current * (dt / 16);
        const pad = 8;
        if (
          witchBox.x < o.x + o.w - pad &&
          witchBox.x + witchBox.w > o.x + pad &&
          witchBox.y < o.y + o.h - pad &&
          witchBox.y + witchBox.h > o.y + pad
        ) {
          // collision
          const final = Math.floor(distance.current / 5);
          setScore(final);
          if (final > best) {
            setBest(final);
            localStorage.setItem("witchrun_best", String(final));
          }
          setState("gameover");
          return;
        }
      }
      obstacles.current = obstacles.current.filter((o) => o.x + o.w > -10);

      draw();
      rafId.current = requestAnimationFrame(loop);
    };
    lastTime.current = 0;
    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [state, draw, best]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || score <= 0 || submitted) return;
    setSubmitting(true);
    const { error } = await supabase.from("leaderboard").insert({ player_name: trimmed.slice(0, 20), score });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      window.dispatchEvent(new CustomEvent("leaderboard:refresh"));
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="relative w-full overflow-hidden rounded-2xl border-4 border-deep shadow-soft bg-deep"
        style={{ aspectRatio: `${GAME_W}/${GAME_H}` }}
        onPointerDown={(e) => {
          e.preventDefault();
          jump();
        }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className="block w-full h-full select-none touch-none"
          style={{ imageRendering: "pixelated" }}
        />
        {state === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-card text-card-foreground rounded-xl p-5 sm:p-6 max-w-xs w-[90%] text-center space-y-3 shadow-glow">
              <h3 className="font-display text-2xl text-deep">Game Over</h3>
              <p className="text-sm text-muted-foreground">Pontuação</p>
              <p className="font-display text-4xl text-primary">{score}</p>
              {!submitted ? (
                <div className="space-y-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    maxLength={20}
                    className="text-center"
                  />
                  <Button onClick={submit} disabled={submitting || !name.trim() || score <= 0} className="w-full">
                    <Trophy className="h-4 w-4" /> Salvar no ranking
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-primary">✨ Salvo no ranking!</p>
              )}
              <Button variant="outline" onClick={() => { reset(); setState("playing"); }} className="w-full">
                <RotateCcw className="h-4 w-4" /> Jogar novamente
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-deep">
        <p className="opacity-80">
          <strong>Espaço</strong> / <strong>Toque</strong> para pular obstáculos.
        </p>
        {state === "idle" && (
          <Button size="sm" onClick={jump}>
            <Play className="h-4 w-4" /> Começar
          </Button>
        )}
      </div>
    </div>
  );
}

function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    setScores((data as Score[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("leaderboard:refresh", onRefresh);
    const channel = supabase
      .channel("leaderboard-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leaderboard" }, () => load())
      .subscribe();
    return () => {
      window.removeEventListener("leaderboard:refresh", onRefresh);
      supabase.removeChannel(channel);
    };
  }, [load]);

  return (
    <aside className="rounded-2xl border-2 border-deep/30 bg-card/80 backdrop-blur-sm p-4 sm:p-5 shadow-soft h-fit">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl text-deep">Ranking Mágico</h2>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Convocando feiticeiros…</p>
      ) : scores.length === 0 ? (
        <p className="text-sm text-muted-foreground">Seja o primeiro a entrar no ranking!</p>
      ) : (
        <ol className="space-y-1.5">
          {scores.map((s, i) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className={`font-display text-lg w-6 text-center ${
                    i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-600" : "text-deep/60"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-semibold text-deep truncate">{s.player_name}</span>
              </span>
              <span className="font-mono font-bold text-primary">{s.score}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
