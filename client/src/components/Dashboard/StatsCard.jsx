export default function StatsCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-teal-50 bg-white p-5 shadow-[0_5px_20px_rgba(15,118,110,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-[0_10px_25px_rgba(15,118,110,0.12)]">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
      </div>

      <div className="min-w-0">
        <h3 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          {stat.value}
        </h3>

        <p className="truncate text-xs font-medium text-slate-500">
          {stat.label}
        </p>
      </div>
    </div>
  );
}
