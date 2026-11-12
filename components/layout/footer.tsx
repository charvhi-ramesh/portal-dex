export function Footer() {
  return (
    <footer id="site-footer" className="mt-16 border-t border-divider bg-bg py-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-2 px-4 text-sm leading-normal sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <a
          href="https://rickandmortyapi.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-blue underline"
        >
          Data from The Rick and Morty API
          <span className="sr-only"> (opens in new tab)</span>
        </a>
        <p className="text-text-muted">
          Unofficial fan project; not affiliated with the show or its owners.
        </p>
      </div>
    </footer>
  );
}
