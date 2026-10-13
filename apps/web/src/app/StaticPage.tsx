export function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose prose-stone">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
