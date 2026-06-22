"use client"

import { useState, useEffect } from "react"

const KEY = "drift_api_key"

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setApiKeyState(localStorage.getItem(KEY) ?? "")
    setIsLoaded(true)
  }, [])

  const setApiKey = (key: string) => {
    localStorage.setItem(KEY, key)
    setApiKeyState(key)
  }

  const clearApiKey = () => {
    localStorage.removeItem(KEY)
    setApiKeyState("")
  }

  return { apiKey, setApiKey, clearApiKey, hasKey: apiKey.length > 0, isLoaded }
}
