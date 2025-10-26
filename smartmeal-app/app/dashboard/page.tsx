import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Smart Meal
            </Link>
            <nav className="flex gap-6">
              <Link href="/dashboard" className="font-medium text-primary">
                Dashboard
              </Link>
              <Link href="/search" className="text-neutral hover:text-foreground">
                Search Recipes
              </Link>
              <Link href="/planner" className="text-neutral hover:text-foreground">
                Meal Planner
              </Link>
              <Link href="/shopping-list" className="text-neutral hover:text-foreground">
                Shopping List
              </Link>
              <Link href="/favorites" className="text-neutral hover:text-foreground">
                Favorites
              </Link>
              <Link href="/profile" className="text-neutral hover:text-foreground">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12" id="main-content">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold">Welcome to Smart Meal 👋</h1>
          <p className="mt-2 text-lg text-neutral">
            Your AI-powered recipe and nutrition planner
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Recipes"
            value="50+"
            description="Sample recipes available"
            icon="📚"
          />
          <StatCard
            title="Meals Planned"
            value="0"
            description="This week"
            icon="📅"
          />
          <StatCard
            title="Shopping Items"
            value="0"
            description="On your list"
            icon="🛒"
          />
          <StatCard
            title="Favorites"
            value="0"
            description="Saved recipes"
            icon="❤️"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              title="Find Recipes"
              description="Search recipes by ingredients"
              href="/search"
              icon="🔍"
            />
            <ActionCard
              title="Plan Your Week"
              description="Organize meals for 7 days"
              href="/planner"
              icon="📅"
            />
            <ActionCard
              title="Shopping List"
              description="Auto-generate from meal plan"
              href="/shopping-list"
              icon="🛒"
            />
            <ActionCard
              title="Browse Favorites"
              description="View saved recipes"
              href="/favorites"
              icon="⭐"
            />
            <ActionCard
              title="Set Goals"
              description="Configure nutrition targets"
              href="/profile"
              icon="🎯"
            />
            <ActionCard
              title="View All Recipes"
              description="Explore 50+ sample recipes"
              href="/recipes"
              icon="📖"
            />
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="mb-6 text-2xl font-bold">Getting Started</h2>
          <div className="space-y-4">
            <StepItem
              number={1}
              title="Search for recipes"
              description="Enter ingredients you have and find matching recipes"
            />
            <StepItem
              number={2}
              title="Add to meal plan"
              description="Drag recipes to your weekly calendar"
            />
            <StepItem
              number={3}
              title="Track nutrition"
              description="Monitor your daily and weekly nutrition goals"
            />
            <StepItem
              number={4}
              title="Generate shopping list"
              description="Auto-create lists from your meal plan"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-neutral">
          © 2024 Smart Meal. Built with Next.js 15 and TypeScript.
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm font-medium text-neutral">{title}</div>
      <div className="mt-1 text-xs text-neutral">{description}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:-translate-y-1"
    >
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold group-hover:text-primary">{title}</h3>
      <p className="mt-1 text-sm text-neutral">{description}</p>
    </Link>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-neutral">{description}</p>
      </div>
    </div>
  );
}
