const BASE = process.env.NEXT_PUBLIC_API_URL!

export type Tier = "free" | "pro"

export interface SignupResponse {
  key: string
  email: string
  tier: Tier
  message: string
}

export interface SignalTicker {
  ticker: string
  scores: Record<string, number>
  composite: number | null
}

export interface SignalResponse {
  as_of: string
  regime: { label: "bull" | "bear" | "sideways"; probabilities: Record<string, number> }
  signals: SignalTicker[]
  factors: string[]
}

export interface WeightItem { ticker: string; weight: number }
export interface OptimiseResponse {
  method: string
  weights: WeightItem[]
  effective_n: number
  as_of: string
}

export interface BacktestMetrics {
  total_return: number; ann_return: number; ann_vol: number
  sharpe: number; sortino: number; max_drawdown: number
  psr: number; dsr: number; n_days: number
}
export interface BacktestResponse {
  metrics: BacktestMetrics
  equity_curve: Record<string, number>
  drawdown: Record<string, number>
  avg_turnover: number
}

interface BacktestJobResponse {
  job_id?: string
  status?: string
  result?: BacktestResponse | null
  detail?: string
  error?: string
}

export interface RiskResponse {
  annualised_vol: number
  factor_variance: number
  specific_variance: number
  factor_contrib: Record<string, number>
  total_variance: number
}

async function request<T>(
  path: string,
  options: RequestInit & { apiKey?: string } = {}
): Promise<T> {
  const { apiKey, ...rest } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(apiKey ? { "X-API-Key": apiKey } : {}),
    ...((rest.headers as Record<string, string>) ?? {}),
  }
  const res = await fetch(`${BASE}${path}`, { ...rest, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  signup: (email: string) =>
    request<SignupResponse>("/auth/signup", {
      method: "POST", body: JSON.stringify({ email }),
    }),

  me: (apiKey: string) =>
    request<{ email: string; tier: Tier; requests_today: number; daily_limit: number; remaining: number; total_calls: number }>(
      "/auth/me", { apiKey }
    ),

  signals: (apiKey: string, tickers: string[], startDate?: string) =>
    request<SignalResponse>("/signals/compute", {
      method: "POST", apiKey,
      body: JSON.stringify({
        tickers,
        provider: "kite",
        benchmark: "^NSEI",
        ...(startDate ? { start_date: startDate } : {}),
      }),
    }),

  optimise: (apiKey: string, tickers: string[], method = "hrp") =>
    request<OptimiseResponse>("/portfolio/optimise", {
      method: "POST", apiKey,
      body: JSON.stringify({
        tickers,
        method,
        provider: "kite",
        benchmark: "^NSEI",
      }),
    }),

  backtest: async (apiKey: string, tickers: string[], method = "hrp") => {
    const started = await request<BacktestJobResponse | BacktestResponse>("/backtest/run", {
      method: "POST", apiKey,
      body: JSON.stringify({
        tickers,
        method,
        provider: "kite",
        benchmark: "^NSEI",
      }),
    })

    if ("metrics" in started) return started
    if (!started.job_id) throw new Error(started.detail ?? "Backtest job did not return an ID.")

    for (let attempt = 0; attempt < 90; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const job = await request<BacktestJobResponse | BacktestResponse>(
        `/backtest/${encodeURIComponent(started.job_id)}`,
        { apiKey }
      )
      if ("metrics" in job) return job

      const status = job.status?.toLowerCase()
      if ((status === "done" || status === "completed" || status === "succeeded") && job.result) {
        return job.result
      }
      if (status === "failed" || status === "error" || status === "cancelled") {
        throw new Error(job.error ?? job.detail ?? "Backtest job failed.")
      }
    }

    throw new Error("Backtest is still running. Please try again shortly.")
  },

  risk: (apiKey: string, weights: Record<string, number>) =>
    request<RiskResponse>("/risk/decompose", {
      method: "POST", apiKey,
      body: JSON.stringify({
        weights,
        provider: "kite",
        benchmark: "^NSEI",
      }),
    }),

  billingStatus: (email: string) =>
    request<{ email: string; tier: Tier }>(`/billing/status?email=${encodeURIComponent(email)}`),

  checkout: (email: string) =>
    request<{ checkout_url: string }>("/billing/checkout", {
      method: "POST", body: JSON.stringify({ email }),
    }),
}
