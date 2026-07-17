/**
 * DashboardCard.jsx
 * ------------------
 * Reusable statistic card displayed on the Dashboard.
 *
 * Props:
 *   title   {string}  – card label  e.g. "Total Students"
 *   value   {number|string} – the statistic to display
 *   icon    {ReactNode}     – SVG icon element
 *   color   {string}  – 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal'
 *   loading {boolean} – shows a skeleton shimmer while data is fetching
 */

// Colour palette map → background, icon bg, icon text
const colorMap = {
  blue:   { card: 'border-l-blue-500',   iconBg: 'bg-blue-100',   iconText: 'text-blue-600'   },
  green:  { card: 'border-l-green-500',  iconBg: 'bg-green-100',  iconText: 'text-green-600'  },
  purple: { card: 'border-l-purple-500', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  orange: { card: 'border-l-orange-500', iconBg: 'bg-orange-100', iconText: 'text-orange-600' },
  red:    { card: 'border-l-red-500',    iconBg: 'bg-red-100',    iconText: 'text-red-600'    },
  teal:   { card: 'border-l-teal-500',   iconBg: 'bg-teal-100',   iconText: 'text-teal-600'   },
}

const DashboardCard = ({ title, value, icon, color = 'blue', loading = false }) => {
  const { card, iconBg, iconText } = colorMap[color] ?? colorMap.blue

  // ── Skeleton shimmer while loading ──────────────────────────
  if (loading) {
    return (
      <div className={`card border-l-4 ${card} p-5 flex items-center gap-4 animate-pulse`}>
        <div className={`h-12 w-12 rounded-xl ${iconBg} shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-6 w-16 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div className={`card border-l-4 ${card} p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200`}>
      {/* Icon container */}
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <span className={iconText}>{icon}</span>
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
          {title}
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {value ?? '—'}
        </p>
      </div>
    </div>
  )
}

export default DashboardCard
