// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part A.
export default function EmptyState({ title, text }: { title: string; text?: string }) {
  return <div><strong>{title}</strong>{text && <div>{text}</div>}</div>;
}
