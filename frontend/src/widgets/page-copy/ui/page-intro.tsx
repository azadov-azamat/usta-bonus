import { Card, CardContent } from "@/shared/ui/card";

type Stat = {
  label: string;
  value: string | number;
};

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats?: Stat[];
};

export function PageIntro({
  eyebrow,
  title,
  description,
  stats = [],
}: PageIntroProps) {
  return (
    <section className="animate-surface-enter space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-balance md:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>

      {stats.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="animate-surface-enter"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="space-y-1 py-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold tracking-[-0.04em]">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
