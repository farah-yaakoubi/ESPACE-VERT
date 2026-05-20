import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  Leaf,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";
import { TimelineEV } from "@/components/qui-sommes-nous/TimelineEV";
import { AnimatedCount } from "@/components/qui-sommes-nous/AnimatedCount";
import AgenceSection from "@/components/qui-sommes-nous/AgenceSection";

const STATS = [
  { value: 1995, label: "Fondé en", icon: Calendar },
  { value: 30, suffix: "+", label: "Ans d'expérience", icon: TrendingUp },
  { value: 100, label: "Collaborateurs", icon: Users },
  { value: 5, label: "Sociétés du groupe", icon: Building2 },
];

const SOCIETES = [
  {
    name: "Espace Vert SARL",
    tag: "Maison mère",
    desc: "Semences, irrigation, matériel agricole et conseil terrain.",
    image: "/logos/logo-espace-vert.png",
    color: "#10693B",
  },
  {
    name: "STAJAP",
    tag: "Espaces verts & sport",
    desc: "Parcs, stades, jardins et équipements professionnels.",
    image: "/logosPartenaires/logo stajap.png",
    color: "#1565C0",
  },
  {
    name: "Mondiale Irrigation",
    tag: "Fabrication",
    desc: "Tuyaux et solutions techniques pour l'irrigation.",
    image: "/logosPartenaires/logo mendial irrigation.png",
    color: "#006064",
  },
  {
    name: "Baddar Agricole",
    tag: "Pépinière & semences",
    desc: "Plants, pépinière et semences spécialisées.",
    image: "/logosPartenaires/logo baddar agricole.png",
    color: "#558B2F",
  },
  {
    name: "Fertivert",
    tag: "Fertilisation",
    desc: "Engrais, fertilisants et biostimulants formulés localement.",
    image: "/logos/FERTIVERT LOGO.png",
    color: "#6B21A8",
  },
];

const DOMAINES = [
  "Semences",
  "Irrigation",
  "Matériel agricole",
  "Fertilisation",
  "Jardinage",
];

const VALEURS = [
  { text: "Qualité produit et service fiable", icon: ShieldCheck },
  { text: "Conseil technique de proximité", icon: Compass },
  { text: "Partenariats solides", icon: CheckCircle2 },
  { text: "Vision durable de la performance agricole", icon: Sprout },
];

function GreenDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent to-ev-200" />
      <Leaf size={15} className="text-ev-400" />
      <div className="h-px flex-1 rounded-full bg-gradient-to-l from-transparent to-ev-200" />
    </div>
  );
}

function SectionFrame({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className={`inline-flex rounded-full border border-ev-200 bg-white px-4 py-2 shadow-sm ${center ? "" : ""}`}>
        <p className="eyebrow !mb-0">{eyebrow}</p>
      </div>
      <div className={`mt-4 border-l-4 border-ev-200 pl-4 sm:pl-5 ${center ? "mx-auto max-w-2xl border-l-0 border-t-4 pt-5 pl-0" : ""}`}>
        <h2 className="site-heading qsn-title-reveal text-[2rem] sm:text-[2.45rem] lg:text-[3.1rem]">{title}</h2>
        {subtitle && <p className="site-copy mt-4">{subtitle}</p>}
      </div>
    </div>
  );
}

function SocietesMarquee() {
  const items = [...SOCIETES, ...SOCIETES];

  return (
    <>
      <style>{`
        @keyframes aboutSocietesMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .about-societes-track {
          animation: aboutSocietesMarquee 28s linear infinite;
        }
        .about-societes-wrap:hover .about-societes-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="about-societes-wrap relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24"
          style={{ background: "linear-gradient(90deg, white, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24"
          style={{ background: "linear-gradient(270deg, white, transparent)" }}
        />

        <div className="about-societes-track flex w-max items-center gap-4 pr-4">
          {items.map((societe, index) => (
            <div key={`${societe.name}-${index}`} className="shrink-0">
              <Image
                src={societe.image}
                alt={societe.name}
                width={960}
                height={640}
                className="h-[88px] w-auto object-contain sm:h-[108px] lg:h-[124px]"
                sizes="(max-width: 640px) 40vw, 240px"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function QuiSommesNousPage() {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes qsnTitleReveal {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes qsnSoftFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .qsn-title-reveal {
          animation: qsnTitleReveal .7s cubic-bezier(.22,1,.36,1) both;
        }
        .qsn-soft-fade {
          animation: qsnSoftFade .55s cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>

      <section className="relative overflow-hidden bg-ev-950">
        <Image
          src="/images/hero/Untitled-4.webp"
          alt="Groupe Espace Vert"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,31,20,.88)_0%,rgba(9,65,38,.78)_45%,rgba(18,105,59,.45)_100%)]" />
        <div className="absolute -right-20 top-14 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full border border-ev-300/20" />

        <div className="relative container-ev pb-14 pt-28 sm:pb-16 sm:pt-32 lg:pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow mb-5 text-ev-200">Groupe Espace Vert · Depuis 1995</p>
              <h1
                className="qsn-title-reveal text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-[3.7rem] lg:text-[4.5rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Qui sommes-nous
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                Un groupe tunisien qui réunit expertise terrain, réseau d&apos;agences et solutions agricoles
                complètes.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#groupe" className="btn-primary">
                  Découvrir le groupe
                </a>
                <a
                  href="#agences"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Voir nos agences
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {DOMAINES.map((domaine) => (
                  <span
                    key={domaine}
                    className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/88 backdrop-blur-sm"
                  >
                    {domaine}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:justify-self-end">
              <div className="rounded-[30px] border border-white/12 bg-white/10 p-6 text-white backdrop-blur-md sm:p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/14">
                    <Leaf size={28} className="text-ev-200" />
                  </div>
                  <div>
                    <p className="text-lg font-black">ESPACE VERT</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ev-200">
                      Innovation · Qualité · Rentabilité
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-7 text-white/78">
                  Cinq sociétés, quatre agences et une même volonté d&apos;accompagner durablement les
                  professionnels de l&apos;agriculture en Tunisie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="groupe" className="border-b border-sand-200 bg-white">
        <div className="container-ev py-10 sm:py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <SectionFrame
              eyebrow="Présentation"
              title="Un groupe structuré au service de l’agriculture tunisienne"
              subtitle="Fondé en 1995, Espace Vert s’est développé autour des semences, de l’irrigation, du matériel agricole et de la fertilisation."
            />

            <div className="space-y-5">
              <div className="rounded-[24px] border border-ev-100 bg-ev-50/60 p-5 sm:p-6">
                <p className="text-sm leading-7 text-ev-900">
                  Le groupe s&apos;appuie aujourd&apos;hui sur des agences régionales, des filiales spécialisées
                  et <strong>trois marques mères</strong> qui structurent son offre sur le marché.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
              {STATS.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-[24px] border border-sand-200 bg-sand-50 px-5 py-5 shadow-[0_18px_40px_rgba(17,24,39,0.04)] sm:px-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-3xl font-black text-ev-950 sm:text-[2.65rem]">
                          <AnimatedCount value={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                          {stat.label}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ev-700 shadow-sm">
                        <Icon size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-sand-200 bg-white">
        <div className="container-ev py-10 sm:py-12 lg:py-14">
          <SectionFrame
            eyebrow="Nos sociétés"
            title="Des activités complémentaires, une même exigence"
            subtitle="Une lecture visuelle du groupe à travers ses principales entités."
          />

          <div className="mt-8">
            <SocietesMarquee />
          </div>
        </div>
      </section>

      <TimelineEV />

      <section className="border-b border-sand-200 bg-ev-950 text-white">
        <div className="container-ev py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ev-300">Notre mission</p>
              </div>
              <h2 className="qsn-title-reveal mt-4 text-[2rem] font-bold leading-tight sm:text-[2.6rem]">
                Accompagner les projets agricoles avec conseil, technique et proximité
              </h2>
              <div className="qsn-soft-fade mt-6 max-w-2xl rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
                <p className="text-[15px] leading-8 text-white/82 sm:text-base">
                  Nous proposons des solutions fiables et un accompagnement concret, depuis le choix produit
                  jusqu&apos;au suivi terrain.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="qsn-soft-fade rounded-2xl border border-white/8 bg-black/10 px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                        <Compass size={18} className="text-ev-300" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ev-300">Conseil</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/78">
                      Une lecture terrain et des recommandations adaptées aux besoins réels des exploitations.
                    </p>
                  </div>
                  <div className="qsn-soft-fade rounded-2xl border border-white/8 bg-black/10 px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                        <Sprout size={18} className="text-ev-300" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ev-300">Suivi</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/78">
                      Un accompagnement durable, du choix de la solution jusqu&apos;à la mise en oeuvre.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="qsn-soft-fade rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.10)] sm:p-7">
              <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                  <Leaf size={18} className="text-ev-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ev-300">Nos principes</p>
                  <p className="mt-1 text-sm text-white/60">Les bases de notre manière de travailler</p>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {VALEURS.map((value) => {
                  const Icon = value.icon;

                  return (
                  <li key={value.text} className="qsn-soft-fade rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3.5 transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/8">
                        <Icon size={16} className="text-ev-300" />
                      </div>
                      <p className="text-sm leading-7 text-white/84">{value.text}</p>
                    </div>
                  </li>
                )})}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div id="agences">
        <AgenceSection />
      </div>

      <section className="bg-white">
        <div className="container-ev py-14 text-center sm:py-16">
          <h2 className="site-subheading qsn-title-reveal text-[2rem] sm:text-[2.5rem]">
            Vous souhaitez échanger avec notre équipe ?
          </h2>
          <p className="site-copy mx-auto mt-4 max-w-2xl">
            Nous sommes à votre disposition pour vous orienter vers la solution la plus adaptée à votre projet.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/contact" className="btn-primary">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
