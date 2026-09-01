import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import app from "../src/app.js";
import { isExpressBackendEnabled } from "../../lib/backend-flag.js";
import { generateExpressAuthToken, expressFetch } from "../../lib/express-client.js";
import { verifyAuthToken, verifyInternalApiToken, verifySessionToken, signTestToken } from "../src/utils/jwt.js";
import { supabaseAdmin } from "../src/config/supabase.js";
import { orchestrator } from "../src/services/ai/orchestrator.js";
import { plansRepository } from "../src/repositories/plans.repository.js";
import http from "http";
import * as jose from "jose";

describe("Phase 5: Next.js Frontend to Express Backend Migration & Feature Flag Tests", () => {
  const testUserId = "phase5-migration-user-" + Date.now();
  let authData;
  let testServer;
  let testServerPort;
  let createdBrandId;
  let createdPlanId;

  beforeAll(async () => {
    // Seed user profile
    await supabaseAdmin.from("profiles").upsert(
      {
        auth_user_id: testUserId,
        email: `${testUserId}@example.com`,
        name: "Phase 5 Tester",
      },
      { onConflict: "auth_user_id" }
    );

    authData = {
      userId: testUserId,
      email: `${testUserId}@example.com`,
      user: { name: "Phase 5 Tester" },
    };

    // Spin up local Express instance on dynamic port to test expressFetch
    testServer = http.createServer(app);
    await new Promise((resolve) => {
      testServer.listen(0, () => {
        testServerPort = testServer.address().port;
        process.env.EXPRESS_BACKEND_URL = `http://localhost:${testServerPort}`;
        resolve();
      });
    });

    // Mock background orchestrator so creation responds fast in tests
    vi.spyOn(orchestrator, "runPlanGeneration").mockResolvedValue({ success: true });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    try {
      if (createdPlanId) {
        await plansRepository.deletePlan(createdPlanId, testUserId);
      }
    } catch {}

    try {
      if (createdBrandId) {
        await supabaseAdmin.from("brand_profiles").delete().eq("id", createdBrandId);
      }
    } catch {}

    try {
      await supabaseAdmin.from("profiles").delete().eq("auth_user_id", testUserId);
    } catch {}

    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
  });

  describe("Task 1 & 2: Feature Flag Setup & Centralized Check", () => {
    it("isExpressBackendEnabled() returns false when USE_EXPRESS_BACKEND is 'false' or unset", () => {
      process.env.USE_EXPRESS_BACKEND = "false";
      expect(isExpressBackendEnabled()).toBe(false);

      delete process.env.USE_EXPRESS_BACKEND;
      expect(isExpressBackendEnabled()).toBe(false);
    });

    it("isExpressBackendEnabled() returns true strictly when USE_EXPRESS_BACKEND is 'true'", () => {
      process.env.USE_EXPRESS_BACKEND = "true";
      expect(isExpressBackendEnabled()).toBe(true);
    });
  });

  describe("Task 1: authData Security & Validation", () => {
    it("generateExpressAuthToken() rejects invalid/tampered authData objects missing userId", async () => {
      await expect(generateExpressAuthToken(null)).rejects.toThrow("Invalid authData");
      await expect(generateExpressAuthToken({})).rejects.toThrow("Invalid authData");
      await expect(generateExpressAuthToken({ email: "attacker@example.com" })).rejects.toThrow("Invalid authData");
      await expect(generateExpressAuthToken({ userId: 12345 })).rejects.toThrow("Invalid authData");
      await expect(generateExpressAuthToken({ userId: "" })).rejects.toThrow("Invalid authData");
    });

    it("expressFetch handles invalid authData gracefully by returning 401 UNAUTHORIZED", async () => {
      const res = await expressFetch("/api/v1/plans", {
        method: "GET",
        authData: { email: "no-user-id@example.com" }, // missing verified userId
      });

      expect(res.ok).toBe(false);
      expect(res.status).toBe(401);
      expect(res.data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("Task 2: Dedicated INTERNAL_API_SECRET & Decoupled Trust Boundary", () => {
    it("generateExpressAuthToken() signs token with INTERNAL_API_SECRET and sets tokenType: 'internal'", async () => {
      const generatedToken = await generateExpressAuthToken(authData);
      expect(typeof generatedToken).toBe("string");

      // Verify specifically via verifyInternalApiToken
      const internalPayload = await verifyInternalApiToken(generatedToken);
      expect(internalPayload.userId).toBe(testUserId);
      expect(internalPayload.email).toBe(authData.email);
      expect(internalPayload.tokenType).toBe("internal");

      // Verify via universal verifyAuthToken
      const payload = await verifyAuthToken(generatedToken);
      expect(payload.userId).toBe(testUserId);
      expect(payload.tokenType).toBe("internal");
    });

    it("Tokens signed with AUTH_SECRET are classified as tokenType: 'session'", async () => {
      const sessionToken = await signTestToken(
        { id: testUserId, email: authData.email },
        "1h",
        false // use AUTH_SECRET
      );

      const payload = await verifyAuthToken(sessionToken);
      expect(payload.userId).toBe(testUserId);
      expect(payload.tokenType).toBe("session");
    });

    it("Rejects tokens signed with an arbitrary third-party secret", async () => {
      const enc = new TextEncoder();
      const fakeToken = await new jose.SignJWT({ id: testUserId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(enc.encode("some-completely-unrelated-random-key-12345678"));

      await expect(verifyAuthToken(fakeToken)).rejects.toThrow();
    });

    it("expressFetch automatically attaches Bearer token and authenticates with Express backend", async () => {
      const res = await expressFetch("/api/v1/plans", {
        method: "GET",
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.data)).toBe(true);
    });
  });

  describe("Task 3: Brands CRUD Forwarding via expressFetch", () => {
    it("POST /api/v1/brands creates a new brand profile", async () => {
      const res = await expressFetch("/api/v1/brands", {
        method: "POST",
        body: {
          name: "Acme Migration Brand",
          product_name: "Acme Product",
          product_description: "Top-tier SaaS tool",
          product_category: "برمجيات / SaaS",
          target_audience: "Founders",
          problem_solved: "Automating content",
          brand_tone: ["احترافي ورسمي"],
        },
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data.name).toBe("Acme Migration Brand");
      createdBrandId = res.data.data.id;
    });

    it("GET /api/v1/brands/:id retrieves the created brand", async () => {
      const res = await expressFetch(`/api/v1/brands/${createdBrandId}`, {
        method: "GET",
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(res.data.data.id).toBe(createdBrandId);
      expect(res.data.data.product_name).toBe("Acme Product");
    });

    it("PUT /api/v1/brands/:id updates brand fields", async () => {
      const res = await expressFetch(`/api/v1/brands/${createdBrandId}`, {
        method: "PUT",
        body: {
          product_name: "Updated Acme Product",
        },
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(res.data.data.product_name).toBe("Updated Acme Product");
    });
  });

  describe("Task 3: Plans Generation & Management via expressFetch", () => {
    it("POST /api/v1/plans starts async generation and responds with { planId, jobId }", async () => {
      const res = await expressFetch("/api/v1/plans", {
        method: "POST",
        body: {
          product_name: "Migration Test Plan",
          product_description: "Testing Phase 5 route forwarding",
          product_category: "برمجيات / SaaS",
          target_audience: "Founders",
          problem_solved: "Testing migration",
          marketing_objective: "brand_awareness",
          brand_tone: ["ودود وقريب للقلب"],
          brand_profile_id: createdBrandId,
        },
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toHaveProperty("planId");
      expect(res.data.data).toHaveProperty("jobId");
      createdPlanId = res.data.data.planId;
    });

    it("GET /api/v1/plans/:id/status polls generation job & export status", async () => {
      const res = await expressFetch(`/api/v1/plans/${createdPlanId}/status`, {
        method: "GET",
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(res.data.data).toHaveProperty("planStatus");
      expect(res.data.data).toHaveProperty("jobStatus");
      expect(res.data.data).toHaveProperty("exportStatus");
    });

    it("POST /api/v1/plans/:id/retry-export returns 409 when plan is not completed yet", async () => {
      const res = await expressFetch(`/api/v1/plans/${createdPlanId}/retry-export`, {
        method: "POST",
        authData,
      });

      expect(res.status).toBe(409);
      expect(res.data.error.code).toBe("INVALID_STATE");
    });

    it("DELETE /api/v1/plans/:id deletes the plan", async () => {
      const res = await expressFetch(`/api/v1/plans/${createdPlanId}`, {
        method: "DELETE",
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      createdPlanId = null;
    });

    it("DELETE /api/v1/brands/:id deletes the brand", async () => {
      const res = await expressFetch(`/api/v1/brands/${createdBrandId}`, {
        method: "DELETE",
        authData,
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      createdBrandId = null;
    });
  });

  describe("Task 4 & 5: Rollback Simulation", () => {
    it("Simulating emergency rollback: flipping USE_EXPRESS_BACKEND='false' instantly disables Express routing with 0 code changes", () => {
      process.env.USE_EXPRESS_BACKEND = "false";
      expect(isExpressBackendEnabled()).toBe(false);
    });
  });
});
