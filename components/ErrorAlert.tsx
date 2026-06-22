interface Props { message: string; onDismiss: () => void }

export function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div style={{
      background: "color-mix(in srgb, var(--red) 8%, transparent)",
      border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)",
      borderRadius: 6, padding: "12px 16px",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: 16,
      fontFamily: "var(--mono)", fontSize: 13,
      color: "var(--red)",
    }}>
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss error" style={{
        background: "none", border: "none",
        color: "var(--red)", cursor: "pointer",
        fontSize: 16, padding: "0 4px",
      }}>×</button>
    </div>
  )
}
