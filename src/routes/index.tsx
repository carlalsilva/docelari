import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Instagram, MessageCircle, Sparkles, Moon, Heart } from "lucide-react";
import witchHero from "@/assets/witch-hero.png";
import tiramisu from "@/assets/recipe-tiramisu.jpg";
import brownie from "@/assets/recipe-brownie.jpg";
import brigadeiro from "@/assets/recipe-brigadeiro.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Docelari — Doces feitos com um toque de magia" },
      {
        name: "description",
        content:
          "Confeitaria artesanal Docelari: brigadeiros, brownies e bolos enfeitiçantes. Encomende agora e descubra o sabor mágico.",
      },
      { property: "og:title", content: "Docelari — Doces com um toque de magia" },
      { property: "og:description", content: "Doces artesanais enfeitiçantes. Encomende já!" },
    ],
  }),
  component: Index,
});

const recipes = [
  { img: tiramisu, name: "Tiramisù Encantado", desc: "Camadas suaves de café e mascarpone." },
  { img: brownie, name: "Brownie da Bruxa", desc: "Denso, intenso e levemente mágico." },
  { img: brigadeiro, name: "Brigadeiro Místico", desc: "O clássico com um toque secreto." },
];

function Index() {
  return (
    <div className="min-h-screen bg-mystic">
      <Header />
      <main>
        <Hero />
        <Recipes />
        <Magic />
        <Orders />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-2 py-4 sm:flex-row sm:justify-between sm:py-5">
          <a href="#" className="flex items-center gap-2">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-deep text-deep-foreground">
              <Moon className="h-4 w-4" />
            </span>
            <span className="font-display text-3xl text-deep">Docelari</span>
          </a>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm font-semibold text-deep sm:gap-x-7">
            <a href="#doces" className="hover:text-primary transition-colors">Nossos Doces</a>
            <a href="#receitas" className="hover:text-primary transition-colors">Grimório</a>
            <a href="#magia" className="hover:text-primary transition-colors">A Magia</a>
            <a href="#encomendas" className="hover:text-primary transition-colors">Encomendas</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-12">
        <div className="relative order-2 md:order-1 mx-auto w-full max-w-sm md:max-w-none">
          <Sparkles className="absolute -top-2 left-2 h-6 w-6 text-accent animate-twinkle" />
          <Sparkles className="absolute top-10 right-0 h-4 w-4 text-primary animate-twinkle" style={{ animationDelay: "0.6s" }} />
          <Moon className="absolute bottom-6 -left-2 h-7 w-7 text-accent animate-twinkle" style={{ animationDelay: "1s" }} />
          <img
            src={witchHero}
            alt="Bruxinha confeiteira segurando bolo e cupcake"
            width={1024}
            height={1024}
            className="relative animate-float w-full h-auto drop-shadow-[0_20px_30px_rgba(95,40,140,0.25)]"
          />
        </div>

        <div className="order-1 md:order-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-deep">
            <Sparkles className="h-3 w-3" /> Confeitaria artesanal
          </span>
          <h1 className="mt-4 text-balance font-display text-4xl leading-[1.05] text-deep sm:text-5xl md:text-6xl">
            Doces feitos com um <em className="not-italic text-primary">toque de magia.</em>
          </h1>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Descubra o sabor enfeitiçante da Docelari — receitas artesanais que conquistam no primeiro pedaço.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
            <a
              href="#encomendas"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4" /> Quero ser enfeitiçado!
            </a>
            <a
              href="#receitas"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-deep transition-colors hover:bg-secondary"
            >
              Ver o grimório
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Recipes() {
  return (
    <section id="receitas" className="px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card/70 p-6 shadow-soft backdrop-blur sm:p-10">
        <div className="text-center">
          <h2 className="font-display text-3xl uppercase tracking-wider text-deep sm:text-4xl">
            Grimório de Receitas
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Os feitiços mais pedidos da casa.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <article
              key={r.name}
              className="group overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={r.img}
                  alt={r.name}
                  width={768}
                  height={768}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl text-deep">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Magic() {
  const items = [
    { icon: Heart, title: "Feito à mão", desc: "Cada doce preparado com carinho, em pequenos lotes." },
    { icon: Sparkles, title: "Ingredientes mágicos", desc: "Selecionamos só o melhor para o seu paladar." },
    { icon: Moon, title: "Encomenda fácil", desc: "Faça seu pedido pelo WhatsApp em minutos." },
  ];
  return (
    <section id="magia" className="px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-3xl text-deep sm:text-4xl">O segredo da magia</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-display text-xl text-deep">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Orders() {
  return (
    <section id="encomendas" className="px-4 pb-20 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-deep p-8 text-center text-deep-foreground shadow-glow sm:p-12">
        <Sparkles className="mx-auto h-8 w-8 text-accent animate-twinkle" />
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Pronto para a magia?</h2>
        <p className="mt-3 text-deep-foreground/80">
          Faça sua encomenda agora pelo WhatsApp e receba um doce feitiço na sua porta.
        </p>
        <a
          href="https://wa.me/5500000000000"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          <MessageCircle className="h-4 w-4" /> Encomendar agora
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-deep text-deep-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 sm:px-6">
        <p className="font-display text-xl">docelarix</p>
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Instagram" className="transition-transform hover:scale-110">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" aria-label="WhatsApp" className="transition-transform hover:scale-110">
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
        <p className="text-xs text-deep-foreground/60">© {new Date().getFullYear()} Docelari · Doces enfeitiçantes</p>
      </div>
    </footer>
  );
}
