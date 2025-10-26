import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8" id="main-content">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary/10),transparent)]" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <span className="text-2xl">🍳</span>
            <span className="font-medium">Smart Recipe Matching with AI</span>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Smart Meal
            <span className="block text-primary">Your AI Chef</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-neutral sm:text-xl">
            Transform ingredients into delicious meals with intelligent recipe matching,
            nutrition tracking, and personalized meal planning.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="rounded-lg border-2 border-neutral/20 px-8 py-3 text-lg font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
            >
              Learn More
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="mt-1 text-sm text-neutral">Sample Recipes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">6</div>
              <div className="mt-1 text-sm text-neutral">Cuisines</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="mt-1 text-sm text-neutral">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to plan perfect meals
            </h2>
            <p className="mt-4 text-lg text-neutral">
              From ingredient matching to nutrition tracking, we've got you covered.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-neutral">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-neutral">
              Get started in 4 simple steps
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-neutral">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start cooking smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Join thousands of home cooks using Smart Meal to plan perfect meals.
          </p>
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-neutral">
              © 2024 Smart Meal. Built with Next.js 15 and TypeScript.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🔍",
    title: "Smart Search",
    description: "Match your ingredients to thousands of recipes with intelligent ranking.",
  },
  {
    icon: "📊",
    title: "Nutrition Tracking",
    description: "Track calories and macros against your personalized goals.",
  },
  {
    icon: "📅",
    title: "Meal Planning",
    description: "Plan your week with drag-and-drop simplicity across 21 meal slots.",
  },
  {
    icon: "🛒",
    title: "Auto Shopping Lists",
    description: "Generate organized shopping lists from your meal plans instantly.",
  },
  {
    icon: "⏱️",
    title: "Cooking Timers",
    description: "Built-in timers for each cooking step ensure perfect results.",
  },
  {
    icon: "🎥",
    title: "Video Tutorials",
    description: "Learn with embedded YouTube cooking videos for each recipe.",
  },
];

const steps = [
  {
    title: "Enter Your Ingredients",
    description: "Tell us what you have in your kitchen - any ingredients will work.",
  },
  {
    title: "Discover Recipes",
    description: "Get matched with recipes ranked by how well they fit your ingredients.",
  },
  {
    title: "Plan Your Week",
    description: "Drag recipes to your weekly calendar and track nutrition goals.",
  },
  {
    title: "Shop & Cook",
    description: "Generate shopping lists and cook with step-by-step timers.",
  },
];
