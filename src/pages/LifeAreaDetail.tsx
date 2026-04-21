import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LifeAreaCard } from "@/components/LifeAreaCard";
import { Button } from "@/components/ui/button";
import { getLifeAreaById, LIFE_AREAS } from "@/data/lifeAreas";
import { ArrowLeft, ArrowRight } from "lucide-react";

const LifeAreaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const card = id ? getLifeAreaById(id) : undefined;

  if (!card) {
    return (
      <AppShell showBack backTo="/life-areas">
        <section className="pt-10 text-center">
          <p className="text-muted-foreground">Life Area not found.</p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            onClick={() => navigate("/life-areas")}
          >
            Back to all areas
          </Button>
        </section>
      </AppShell>
    );
  }

  const idx = LIFE_AREAS.findIndex((c) => c.id === card.id);
  const prev = idx > 0 ? LIFE_AREAS[idx - 1] : null;
  const next = idx < LIFE_AREAS.length - 1 ? LIFE_AREAS[idx + 1] : null;

  return (
    <AppShell showBack backTo="/life-areas">
      <section className="pt-2 pb-6 animate-fade-up">
        <LifeAreaCard card={card} size="full" />
      </section>

      <section className="mt-2 animate-fade-up [animation-delay:120ms]">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
          What this area asks of you
        </p>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          {card.deeperMeaning}
        </p>
      </section>

      <section className="mt-8 animate-fade-up [animation-delay:200ms]">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Sit with these
        </p>
        <div className="grid gap-2.5">
          {card.prompts.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl bg-card/60 backdrop-blur border border-border/50 px-4 py-3 text-[14px] leading-relaxed text-foreground/90"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* Related areas in the same theme — invites lateral exploration */}
      {(() => {
        const related = LIFE_AREAS.filter(
          (c) => c.theme === card.theme && c.id !== card.id,
        ).slice(0, 4);
        if (related.length === 0) return null;
        return (
          <section className="mt-10 animate-fade-up [animation-delay:280ms]">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              Often surfaces alongside
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/life-areas/${r.id}`)}
                  className="text-left rounded-2xl bg-card/50 backdrop-blur border border-border/50 px-4 py-3 hover:bg-card/80 transition-smooth"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                    {r.theme}
                  </p>
                  <p className="font-display text-[15px] text-foreground mt-0.5">
                    {r.name}
                  </p>
                </button>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Prev / next */}
      <div className="mt-10 mb-4 flex items-center justify-between gap-3">
        {prev ? (
          <button
            onClick={() => navigate(`/life-areas/${prev.id}`)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {prev.name}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            onClick={() => navigate(`/life-areas/${next.id}`)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-smooth"
          >
            {next.name}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </AppShell>
  );
};

export default LifeAreaDetail;
