export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  fallbackModels: string[];
  provider: "groq" | "gemini" | "openrouter" | "openai" | "custom";
}

export function getLlmConfig(): LlmConfig | null {
  const rawKey = process.env.OPENAI_API_KEY?.trim();
  if (!rawKey) return null;

  let baseUrl = process.env.OPENAI_BASE_URL?.trim();
  let model = process.env.OPENAI_MODEL?.trim();
  let fallbackModels: string[] = [];
  let provider: LlmConfig["provider"] = "custom";

  if (rawKey.startsWith("gsk_")) {
    provider = "groq";
    if (!baseUrl || baseUrl === "https://api.openai.com/v1") {
      baseUrl = "https://api.groq.com/openai/v1";
    }
    fallbackModels = [
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "llama-3.3-70b-versatile",
    ];
    if (!model || model === "gpt-4o-mini") {
      model = "openai/gpt-oss-20b";
    }
  } else if (rawKey.startsWith("AIzaSy")) {
    provider = "gemini";
    if (!baseUrl || baseUrl === "https://api.openai.com/v1") {
      baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
    }
    fallbackModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
    if (!model || model === "gpt-4o-mini") {
      model = "gemini-2.0-flash";
    }
  } else if (rawKey.startsWith("sk-or-v1-")) {
    provider = "openrouter";
    if (!baseUrl || baseUrl === "https://api.openai.com/v1") {
      baseUrl = "https://openrouter.ai/api/v1";
    }
    fallbackModels = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
    ];
    if (!model || model === "gpt-4o-mini") {
      model = "meta-llama/llama-3.3-70b-instruct:free";
    }
  } else {
    provider = "openai";
    baseUrl = baseUrl || "https://api.openai.com/v1";
    fallbackModels = ["gpt-4o-mini", "gpt-3.5-turbo"];
    model = model || "gpt-4o-mini";
  }

  const candidateModels = Array.from(new Set([model, ...fallbackModels]));

  return {
    apiKey: rawKey,
    baseUrl,
    model,
    fallbackModels: candidateModels,
    provider,
  };
}
