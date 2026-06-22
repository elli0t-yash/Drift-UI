export function Spinner() {
  return (
    <div role="status" aria-label="Loading" style={{
      width: 20, height: 20,
      border: "2px solid var(--border)",
      borderTop: "2px solid var(--teal)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      display: "inline-block",
    }} />
  )
}
