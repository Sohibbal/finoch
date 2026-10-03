import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getLlmConfig } from "@/lib/llm/llm-client";

describe("LLM Client Auto Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns null when OPENAI_API_KEY is not defined", () => {
    delete process.env.OPENAI_API_KEY;
    expect(getLlmConfig()).toBeNull();
  });

  it("auto detects Groq provider and sets appropriate endpoint and model", () => {
    process.env.OPENAI_API_KEY = "gsk_testkey12345";
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;

    const config = getLlmConfig();
    expect(config).not.toBeNull();
    expect(config?.provider).toBe("groq");
    expect(config?.baseUrl).toBe("https://api.groq.com/openai/v1");
    expect(config?.model).toBe("llama-3.3-70b-versatile");
  });

  it("auto detects Gemini provider and sets Google OpenAI-compatible endpoint", () => {
    process.env.OPENAI_API_KEY = "AIzaSyTestGeminiKey123";
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;

    const config = getLlmConfig();
    expect(config).not.toBeNull();
    expect(config?.provider).toBe("gemini");
    expect(config?.baseUrl).toBe("https://generativelanguage.googleapis.com/v1beta/openai/");
    expect(config?.model).toBe("gemini-2.0-flash");
  });

  it("auto detects OpenRouter provider", () => {
    process.env.OPENAI_API_KEY = "sk-or-v1-testkey123";
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;

    const config = getLlmConfig();
    expect(config).not.toBeNull();
    expect(config?.provider).toBe("openrouter");
    expect(config?.baseUrl).toBe("https://openrouter.ai/api/v1");
    expect(config?.model).toBe("meta-llama/llama-3.3-70b-instruct:free");
  });

  it("defaults to OpenAI when standard sk- key is used", () => {
    process.env.OPENAI_API_KEY = "sk-proj-testkey123";
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;

    const config = getLlmConfig();
    expect(config).not.toBeNull();
    expect(config?.provider).toBe("openai");
    expect(config?.baseUrl).toBe("https://api.openai.com/v1");
    expect(config?.model).toBe("gpt-4o-mini");
  });

  it("respects custom base URL and model if explicitly configured", () => {
    process.env.OPENAI_API_KEY = "gsk_custom";
    process.env.OPENAI_BASE_URL = "https://custom.endpoint.com/v1";
    process.env.OPENAI_MODEL = "custom-llama";

    const config = getLlmConfig();
    expect(config?.baseUrl).toBe("https://custom.endpoint.com/v1");
    expect(config?.model).toBe("custom-llama");
  });
});
