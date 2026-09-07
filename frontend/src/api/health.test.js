import { describe, expect, it, vi } from "vitest";
import { getHealth } from "./health";

describe("health API", () => {
  it("should return backend health", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "UP",
        service: "ai-knowledge-copilot",
      }),
    });

    const result = await getHealth();

    expect(result.status).toBe("UP");
    expect(result.service).toBe("ai-knowledge-copilot");
  });
});