import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  session: vi.fn(), config: vi.fn(), compare: vi.fn(), hash: vi.fn(),
  user: { findUnique: vi.fn(), create: vi.fn() },
  expense: { findMany: vi.fn(), create: vi.fn() },
  financialProfile: { findUnique: vi.fn(), upsert: vi.fn() },
  financialGoal: { findMany: vi.fn() },
  recognize: vi.fn(), terminate: vi.fn(), createWorker: vi.fn(),
}));
vi.mock("@/lib/auth/jwt", () => ({ getSessionFromRequest: mocks.session, signSessionToken: vi.fn(), COOKIE_NAME: "voicash_session", getCookieOptions: vi.fn(() => ({})) }));
vi.mock("@/lib/prisma", () => ({ prisma: mocks }));
vi.mock("@/lib/llm/llm-client", () => ({ getLlmConfig: mocks.config }));
vi.mock("bcryptjs", () => ({ default: { compare: mocks.compare, hash: mocks.hash } }));
vi.mock("tesseract.js", () => ({ default: { createWorker: mocks.createWorker } }));
vi.mock("child_process", () => ({ spawn: () => ({ stdout: { on: vi.fn() }, stderr: { on: vi.fn() }, on: (event: string, cb: (code: number) => void) => { if (event === "close") queueMicrotask(() => cb(1)); } }) }));
import { POST as voice } from "@/app/api/transactions/parse-voice/route";
import { POST as copilot } from "@/app/api/copilot/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as expenses } from "@/app/api/expenses/route";
import { POST as profile } from "@/app/api/profile/route";
import { POST as ocr } from "@/app/api/transactions/ocr/route";
import { jakartaDate } from "@/app/api/validation";
const request = (body: unknown) => new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
const modelReply = (value: unknown) => Response.json({ choices: [{ message: { content: JSON.stringify(value) } }] });
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.session.mockResolvedValue({ userId: "user1" });
  mocks.config.mockReturnValue(null);
  mocks.user.findUnique.mockResolvedValue(null);
  mocks.compare.mockResolvedValue(false);
  mocks.financialProfile.findUnique.mockResolvedValue({ monthlyIncome: 100000 });
  mocks.expense.findMany.mockResolvedValue([]);
  mocks.financialGoal.findMany.mockResolvedValue([]);
  mocks.createWorker.mockResolvedValue({ recognize: mocks.recognize, terminate: mocks.terminate });
  mocks.terminate.mockResolvedValue(undefined);
  fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("API security", () => {
  it.each([voice, copilot])("requires a session", async (route) => {
    mocks.session.mockResolvedValue(null);
    expect((await route(request({}))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([voice, copilot, login, register, expenses, profile])("rejects malformed JSON", async (route) => {
    expect((await route(new Request("http://localhost", { method: "POST", body: "{" }))).status).toBe(400);
    expect((await route(request(null))).status).toBe(400);
  });
  it("caps transcript and message length", async () => {
    expect((await voice(request({ transcript: "a".repeat(1001) }))).status).toBe(400);
    expect((await copilot(request({ message: "a".repeat(2001) }))).status).toBe(400);
  });
  it("retries voice providers and validates model items", async () => {
    mocks.config.mockReturnValue({ baseUrl: "http://llm", model: "first", fallbackModels: ["second"] });
    fetchMock.mockResolvedValueOnce(new Response("rate limited", { status: 429 })).mockResolvedValueOnce(modelReply({ items: [
      { amount: -1 }, { amount: 0 }, { amount: "Infinity" }, null,
      { amount: 100, category: "injected", itemName: "food" },
    ] }));
    const result = await (await voice(request({ transcript: "makan" }))).json();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ amount: 100, category: "Other" });
  });
  it("uses server facts, Jakarta month boundaries, and ordered goals without leaking provider errors", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-30T18:00:00Z"));
    mocks.expense.findMany.mockResolvedValue([{ amount: 200, category: "Other" }]);
    mocks.config.mockReturnValue({ baseUrl: "http://llm", model: "first" });
    fetchMock.mockResolvedValue(new Response("private provider diagnostic", { status: 500 }));
    const result = await (await copilot(request({ message: "halo", facts: { monthlyIncome: "injected" } }))).json();
    expect(result.reply).toContain("100.000"); expect(result.reply).toContain("200");
    expect(JSON.stringify(result)).not.toContain("private provider diagnostic");
    expect(result).not.toHaveProperty("llmDiagnostic");
    expect(mocks.expense.findMany).toHaveBeenCalledWith({ where: { userId: "user1", isDeleted: false, createdAt: { gte: new Date("2026-09-30T17:00:00Z"), lt: new Date("2026-10-31T17:00:00Z") } } });
    expect(mocks.financialGoal.findMany.mock.calls[0][0].orderBy).toBeDefined();
  });
  it.each([login, register])("limits auth attempts and expires the window", async (route) => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2030-01-01"));
    const email = route === login ? "login@rate.test" : "register@rate.test";
    for (let i = 0; i < 10; i++) await route(request({ email, password: "short", name: "A" }));
    expect((await route(request({ email, password: "short", name: "A" }))).status).toBe(429);
    vi.advanceTimersByTime(15 * 60 * 1000);
    expect((await route(request({ email, password: "short", name: "A" }))).status).not.toBe(429);
  });
  it("compares a dummy bcrypt hash for missing users", async () => {
    expect((await login(request({ email: "missing@user.test", password: "password" }))).status).toBe(401);
    expect(mocks.compare).toHaveBeenCalledWith("password", expect.stringMatching(/^\$2b\$10\$/));
  });
  it("requires eight-character passwords and handles registration races", async () => {
    expect((await register(request({ email: "short@user.test", password: "1234567", name: "A" }))).status).toBe(400);
    mocks.user.create.mockRejectedValue({ code: "P2002" });
    expect((await register(request({ email: "race@user.test", password: "12345678", name: "A" }))).status).toBe(409);
  });
  it.each([{ amount: -1 }, { amount: 1.5 }, { amount: 2_000_000_001 }, { amount: "5" }, { itemName: "a".repeat(201) }, { createdAt: "2026-02-30" }, { createdAt: "bad" }])("validates expenses: %j", async (invalid) => {
    expect((await expenses(request({ itemName: "Makan", amount: 100, category: "Other", ...invalid }))).status).toBe(400);
    expect(mocks.expense.create).not.toHaveBeenCalled();
  });
  it("rejects oversized OCR before reading form data", async () => {
    const req = new Request("http://localhost", { method: "POST", headers: { "content-length": String(10 * 1024 * 1024 + 1) } });
    const parse = vi.spyOn(req, "formData");
    expect((await ocr(req)).status).toBe(413); expect(parse).not.toHaveBeenCalled();
  });
  it("caps direct OCR text", async () => {
    const form = new FormData(); form.set("text", "a".repeat(20001));
    expect((await ocr(new Request("http://localhost", { method: "POST", body: form }))).status).toBe(400);
  });
  it("terminates the Tesseract worker after recognition failure", async () => {
    mocks.recognize.mockRejectedValue(new Error("recognition failed"));
    const form = new FormData(); form.set("image", new Blob(["image"]), "receipt.png");
    await ocr(new Request("http://localhost", { method: "POST", body: form }));
    expect(mocks.terminate).toHaveBeenCalledTimes(1);
  });
  it("bounds OCR retries and uses Jakarta dates", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-30T18:00:00Z"));
    expect(jakartaDate()).toBe("2026-10-01");
    mocks.recognize.mockResolvedValue({ data: { text: "receipt total 10000" } });
    mocks.config.mockReturnValue({ baseUrl: "http://llm", model: "one", fallbackModels: ["two", "three", "four"] });
    fetchMock.mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce(new Response("busy", { status: 429 })).mockResolvedValueOnce(modelReply({ amount: 10000 }));
    const form = new FormData(); form.set("image", new Blob(["image"]), "receipt.png");
    const result = await (await ocr(new Request("http://localhost", { method: "POST", body: form }))).json();
    expect(result.candidate.date).toBe("2026-10-01"); expect(fetchMock).toHaveBeenCalledTimes(3);
    fetchMock.mockReset().mockResolvedValue(new Response("busy", { status: 429 }));
    await ocr(new Request("http://localhost", { method: "POST", body: form }));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe("normalizeExpenseCategory", () => {
  it.each([
    ["Food & Drinks", "Food & Drinks"], ["Shopping", "Shopping & Lifestyle"], ["Housing & Bills", "Bills & Utilities"],
    ["Entertainment & Leisure", "Shopping & Lifestyle"], ["Crypto", "Other"], [undefined, "Other"],
  ])("%s -> %s", async (input, expected) => {
    const { normalizeExpenseCategory } = await import("@/app/api/validation");
    expect(normalizeExpenseCategory(input)).toBe(expected);
  });
});
