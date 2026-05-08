import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { ArrowRight, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404 — unknown route:", location.pathname);
  }, [location.pathname]);

  return (
    <AppShell>
      <section className={cn(layout.pageHeader, layout.pageSection, "pt-10")}>
        <div className={layout.pageIntro}>
          <p className={layout.eyebrow}>You've wandered off the path</p>
          <h1 className={layout.title}>
            Nothing lives <span className="font-medium italic">here</span>.
          </h1>
          <p className={layout.body}>
            The page you were looking for doesn't exist — or has quietly moved.
            Pick a way back below.
          </p>
        </div>
      </section>

      <div className={cn(layout.actionBlock, "mt-6 grid gap-3")}>
        <Button asChild size="lg" className="w-full rounded-full bg-gradient-button text-primary-foreground h-14 text-base shadow-soft">
          <Link to="/">
            Back to home
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full rounded-full h-12">
          <Link to="/readings">
            <Compass className="mr-2 h-4 w-4" strokeWidth={1.7} />
            Explore readings
          </Link>
        </Button>
      </div>
    </AppShell>
  );
};

export default NotFound;
