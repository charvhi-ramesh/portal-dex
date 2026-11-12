// Decorative fixed star field. All styling and motion live in app/globals.css.
export function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      <div className="star-layer star-layer-1" />
      <div className="star-layer star-layer-2" />
      <div className="star-layer star-layer-3" />
    </div>
  );
}
