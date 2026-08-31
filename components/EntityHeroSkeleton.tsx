export default function EntityHeroSkeleton() {
  return (
    <div className="hero scrollable">
      <div className="skeleton-backdrop" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="skeleton-cover" />
        <div className="skeleton-title" />
        <div className="skeleton-subtitle" />
        <div className="skeleton-platforms">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="skeleton-platform" />
          ))}
        </div>
      </div>
    </div>
  );
}
