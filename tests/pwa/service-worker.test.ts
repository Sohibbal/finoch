import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import vm from "node:vm";

function serviceWorker() {
  const handlers: Record<string, (event: any) => void> = {};
  const cache = { match: vi.fn().mockResolvedValue(undefined), put: vi.fn().mockResolvedValue(undefined) };
  const caches = { keys: vi.fn(), delete: vi.fn(), open: vi.fn().mockResolvedValue(cache) };
  const fetch = vi.fn().mockResolvedValue(new Response("fresh"));
  const context = vm.createContext({ URL, Response, caches, fetch, console,
    self: { location: { origin: "https://finoch.test" }, clients: { claim: vi.fn() },
      addEventListener: (name: string, handler: any) => { handlers[name] = handler; } } });
  vm.runInContext(fs.readFileSync("public/sw.js", "utf8"), context);
  return { handlers, caches, cache, fetch, route: context.getFetchStrategy };
}
const request = (path: string, options = {}) => ({ url: `https://finoch.test${path}`, method: "GET", mode: "cors", headers: new Headers(), ...options });

describe("service worker cache isolation and routing", () => {
  it("deletes only obsolete app shell versions", async () => {
    const sw = serviceWorker();
    sw.caches.keys.mockResolvedValue(["finoch-shell-v3", "voicash-shell-v2", "finoch-shell-v4", "transformers-cache", "finoch-whisper-wasm", "other-app"]);
    let pending: Promise<unknown> = Promise.resolve();
    sw.handlers.activate({ waitUntil: (value: Promise<unknown>) => { pending = value; } });
    await pending;
    expect(sw.caches.delete.mock.calls).toEqual([["finoch-shell-v3"], ["voicash-shell-v2"]]);
  });
  it.each(["/api", "/api/expenses", "/dashboard", "/photo.jpg", "/manifest.webmanifest"])("bypasses %s", path => {
    expect(serviceWorker().route(request(path), "https://finoch.test")).toBe("bypass");
  });
  it("bypasses cross-origin model files and writes", () => {
    const { route } = serviceWorker();
    expect(route(request("/", { url: "https://huggingface.co/model.onnx" }), "https://finoch.test")).toBe("bypass");
    expect(route(request("/icons/a.png", { method: "POST" }), "https://finoch.test")).toBe("bypass");
  });
  it.each(["/_next/static/a.js", "/icons/a.png", "/fonts/a.woff2", "/wasm/a.wasm", "/finoch-logo.svg", "/favicon.ico"])("cache-first for %s", path => {
    expect(serviceWorker().route(request(path), "https://finoch.test")).toBe("cache-first");
  });
  it("uses the network for navigations and both RSC request forms", () => {
    const { route } = serviceWorker();
    for (const req of [request("/dashboard", { mode: "navigate" }), request("/dashboard?_rsc=abc"), request("/dashboard", { headers: new Headers({ RSC: "1" }) })]) {
      expect(route(req, "https://finoch.test")).toBe("network-first");
    }
  });
  it("never serves cached HTML or stale RSC when an RSC fetch fails", async () => {
    const sw = serviceWorker();
    sw.fetch.mockRejectedValue(new Error("offline"));
    sw.cache.match.mockResolvedValue(new Response("stale HTML"));
    let response: Promise<Response> = Promise.resolve(new Response());
    sw.handlers.fetch({ request: request("/dashboard?_rsc=old"), respondWith: (value: Promise<Response>) => { response = value; } });
    expect((await response).status).toBe(503);
    expect(sw.cache.match).not.toHaveBeenCalled();
    expect(sw.cache.put).not.toHaveBeenCalled();
  });
  it("never caches a navigation that was redirected (e.g. to /login)", async () => {
    const sw = serviceWorker();
    const redirected = new Response("login page");
    Object.defineProperty(redirected, "redirected", { value: true });
    sw.fetch.mockResolvedValue(redirected);
    let response: Promise<Response> = Promise.resolve(new Response());
    sw.handlers.fetch({ request: request("/dashboard", { mode: "navigate" }), respondWith: (value: Promise<Response>) => { response = value; } });
    expect(await (await response).text()).toBe("login page");
    expect(sw.cache.put).not.toHaveBeenCalled();
  });
  it("serves a cached wasm without making a network request", async () => {
    const sw = serviceWorker();
    sw.cache.match.mockResolvedValue(new Response("wasm"));
    let response: Promise<Response> = Promise.resolve(new Response());
    sw.handlers.fetch({ request: request("/wasm/ort-wasm.wasm"), respondWith: (value: Promise<Response>) => { response = value; } });
    expect(await (await response).text()).toBe("wasm");
    expect(sw.caches.open).toHaveBeenCalledWith("finoch-whisper-wasm");
    expect(sw.fetch).not.toHaveBeenCalled();
  });
});
