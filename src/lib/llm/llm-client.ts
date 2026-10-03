export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: "groq" | "gemini" | "openrouter" | "openai" | "custom";
}

export function getLlmConfig(): LlmConfig | null {
  const rawKey = process.env.OPENAI_API_KEY?.trim();
  if (!rawKey) return null;

  let baseUrl = process.env.OPENAI_BASE_URL?.trim();
  let model = process.env.OPENAI_MODEL?.trim();
  let provider: LlmConfig["provider"] = "custom";

  if (rawKey.startsWith("gsk_")) {
    provider = "groq";
    if (!baseUrl || baseUrl === "https://api.openai.com/v1") {
      baseUrl = "https://api.groq.com/openai/v1";
    }
    if (!model || model === "gpt-4o-mini") {
      model = "llama-3.3-70b-versatile";
    }
  } else if (rawKey.startsWith("AIzaSy")) {
    provider = "gemini";
    if (!baseUrl || baseUrl === "https://api.openai.com/v1") {
      baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
    }
    if (!model || model === "gpt-4o-mini") {
      model = "gemini-2.0-flash";
    }
  } else if (rawKey.startsWith("sk-or-v1-")) {
    provider = "openrouter";
    if (!baseUrl || baseUrl === "https://api.openai.com/v1") {
      baseUrl = "https://openrouter.ai/api/v1";
    }
    if (!model || model === "gpt-4o-mini") {
      model = "meta-llama/llama-3.3-70b-instruct:free";
    }
  } else {
    provider = "openai";
    baseUrl = baseUrl || "https://api.openai.com/v1";
    model = model || "gpt-4o-mini";
  }

  return {
    apiKey: rawKey,
    baseUrl,
    model,
    provider,
  };
}
