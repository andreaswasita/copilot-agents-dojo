import { describe, it, expect, beforeAll } from "vitest";
import { app } from "../src/index.js";

describe("API Routes", () => {
  describe("GET /api/skills", () => {
    it("returns an array", async () => {
      const res = await app.request("/api/skills");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe("GET /api/agents", () => {
    it("returns an array", async () => {
      const res = await app.request("/api/agents");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe("GET /api/categories", () => {
    it("returns category definitions", async () => {
      const res = await app.request("/api/categories");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("core-kata");
      expect(body["core-kata"]).toHaveProperty("icon");
      expect(body["core-kata"]).toHaveProperty("label");
    });
  });

  describe("GET /api/stats", () => {
    it("returns stats object", async () => {
      const res = await app.request("/api/stats");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("skillCount");
      expect(body).toHaveProperty("agentCount");
      expect(body).toHaveProperty("profileCount");
    });
  });

  describe("GET /api/skills/tags", () => {
    it("returns array of tag strings", async () => {
      const res = await app.request("/api/skills/tags");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
