"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ErrorAlert } from "@/components/ErrorAlert"
import { Spinner } from "@/components/Spinner"
import { api } from "@/lib/api"
import { useApiKey } from "@/lib/useApiKey"

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 6,
  border: "1px solid var(--border)", background: "var(--surface)",
  color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13,
}

export default function SignupPage() {
  const router = useRouter()
  const { setApiKey, hasKey, isLoaded } = useApiKey()
  const [email, setEmail] = useState("")
  const [manualKey, setManualKey] = useState("")
  const [showManual, setShowManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isLoaded && hasKey) router.replace("/dashboard")
  }, [hasKey, isLoaded, router])

  const signup = async () => {
    if (!email.trim()) return setError("Enter a valid email address.")
    setLoading(true)
    setError("")
    try {
      const result = await api.signup(email.trim())
      setApiKey(result.key)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your API key.")
    } finally {
      setLoading(false)
    }
  }

  const saveManualKey = () => {
    if (!manualKey.trim()) return setError("Paste your API key first.")
    setApiKey(manualKey.trim())
    router.push("/dashboard")
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ width: "100%", maxWidth: 420, padding: 32, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}>
        <Link href="/" style={{ color: "var(--teal)", fontFamily: "var(--mono)", textDecoration: "none", fontWeight: 700 }}>📡 drift</Link>
        <h1 style={{ marginTop: 28, fontFamily: "var(--mono)", fontSize: 28 }}>Get your API key</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: "10px 0 24px" }}>Start free with no credit card required. Your key unlocks live factor signals and portfolio tools.</p>
        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
        <input type="email" value={email} onChange={event => setEmail(event.target.value)} onKeyDown={event => event.key === "Enter" && signup()} placeholder="you@example.com" aria-label="Email address" style={inputStyle} />
        <button onClick={signup} disabled={loading} className="nav-cta" style={{ width: "100%", marginTop: 12, padding: 12, border: "none", cursor: loading ? "wait" : "pointer" }}>
          {loading ? <Spinner /> : "Get free key"}
        </button>
        <div style={{ marginTop: 22, display: "grid", gap: 14, fontFamily: "var(--mono)", fontSize: 12 }}>
          <button onClick={() => setShowManual(value => !value)} style={{ border: 0, padding: 0, background: "none", color: "var(--muted)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>Already have a key? → Enter it manually</button>
          {showManual && (
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={manualKey} onChange={event => setManualKey(event.target.value)} placeholder="Paste API key" aria-label="API key" style={inputStyle} />
              <button onClick={saveManualKey} className="nav-cta" style={{ border: 0, cursor: "pointer" }}>Save</button>
            </div>
          )}
          <Link href="/pricing" style={{ color: "var(--teal)", textDecoration: "none" }}>Upgrade to Pro →</Link>
        </div>
      </section>
    </main>
  )
}
