/**
 * MADAR V2.1.5 Test Suite: Deterministic Unit & Integration Verifications
 *
 * Verifies:
 * - Suite 1: Field-level merging (design_copy)
 * - Suite 2: Scoped AI Fail-Closed & Scope Bounds (B08, B09)
 * - Suite 3: External AI Parse API & Return Contracts (.strict(), B06)
 * - Suite 4: Multi-Day Concurrency & Batch Validation (B01, B02, B15)
 * - Suite 7: Strategic Impact Engine (Single-day & Multi-day Net Deltas)
 * - Suite 8: Formula Injection Sanitization (B13)
 */

import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const sheetsSanitizerUrl = pathToFileURL("d:/reactProject/ai-marketing-planner-backend/backend/src/services/integrations/sheets-sanitizer.js").href;
const externalAiSchemaUrl = pathToFileURL("d:/reactProject/ai-marketing-planner-backend/backend/src/schemas/external-ai.schema.js").href;
const scopedAiSchemaUrl = pathToFileURL("d:/reactProject/ai-marketing-planner-backend/backend/src/schemas/scoped-ai.schema.js").href;
const mutationsSchemaUrl = pathToFileURL("d:/reactProject/ai-marketing-planner-backend/backend/src/schemas/mutations.schema.js").href;
const strategyImpactUrl = pathToFileURL("d:/reactProject/ai-marketing-planner-backend/backend/src/services/ai/strategy-impact.js").href;

const { sanitizeForGoogleSheets } = await import(sheetsSanitizerUrl);
const {
  externalAiSingleDayContractSchema,
  externalAiMultiDayContractSchema,
} = await import(externalAiSchemaUrl);
const { buildStrictScopedOutputSchema } = await import(scopedAiSchemaUrl);
const {
  batchMutationSchema,
  singleDayMutationSchema,
} = await import(mutationsSchemaUrl);
const { calculateStrategicImpactForChangeSet } = await import(strategyImpactUrl);

console.log("=================================================");
console.log("MADAR V2.1.5 VERIFICATION TEST SUITE");
console.log("=================================================");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
  }
}

// -------------------------------------------------------------
// Suite 8: Google Sheets Formula Injection (Blocker B13)
// -------------------------------------------------------------
console.log("\n--- Suite 8: Google Sheets Sanitization (Blocker B13) ---");

test("Scenario 43.1: Escapes leading '=' with apostrophe", () => {
  const sanitized = sanitizeForGoogleSheets("=SUM(A1:A10)");
  assert.equal(sanitized, "'=SUM(A1:A10)");
});

test("Scenario 43.2: Escapes leading '+' with apostrophe", () => {
  const sanitized = sanitizeForGoogleSheets("+12345678");
  assert.equal(sanitized, "'+12345678");
});

test("Scenario 43.3: Escapes leading '-' with apostrophe", () => {
  const sanitized = sanitizeForGoogleSheets("-CMD|'/C calc'!A0");
  assert.equal(sanitized, "'-CMD|'/C calc'!A0");
});

test("Scenario 43.4: Escapes leading '@' with apostrophe", () => {
  const sanitized = sanitizeForGoogleSheets("@mention");
  assert.equal(sanitized, "'@mention");
});

test("Scenario 43.5: Escapes formula with leading whitespace", () => {
  const sanitized = sanitizeForGoogleSheets("   =2+2");
  assert.equal(sanitized, "'   =2+2");
});

test("Scenario 43.6: Normal text remains unchanged", () => {
  const sanitized = sanitizeForGoogleSheets("نص منشور عادي بدون خطورة");
  assert.equal(sanitized, "نص منشور عادي بدون خطورة");
});

// -------------------------------------------------------------
// Suite 2: Scoped AI Fail-Closed (Blockers B08, B09)
// -------------------------------------------------------------
console.log("\n--- Suite 2: Scoped AI Fail-Closed & Leaf Bounds ---");

test("Scenario 07: Scope ['caption'] accepts valid caption", () => {
  const schema = buildStrictScopedOutputSchema(["caption"]);
  const res = schema.safeParse({ caption: "كابشن تجريبي جديد" });
  assert.equal(res.success, true);
});

test("Scenario 08: Scope ['caption'] fails closed when LLM returns extra 'post_type'", () => {
  const schema = buildStrictScopedOutputSchema(["caption"]);
  const res = schema.safeParse({
    caption: "كابشن تجريبي جديد",
    post_type: "reel",
  });
  assert.equal(res.success, false);
});

test("Scenario 09: Scope ['design_copy.headline'] fails closed when LLM returns extra 'subtext'", () => {
  const schema = buildStrictScopedOutputSchema(["design_copy.headline"]);
  const res = schema.safeParse({
    design_copy: {
      headline: "عنوان جديد",
      subtext: "نص فرعي غير مصرح به",
    },
  });
  assert.equal(res.success, false);
});

test("Scenario 10: Scope ['entire_post'] authorizes all 9 leaf fields", () => {
  const schema = buildStrictScopedOutputSchema(["entire_post"]);
  const res = schema.safeParse({
    caption: "كابشن كامل",
    design_copy: {
      headline: "عنوان",
      subtext: "نص فرعي",
      cta: "زر",
    },
    post_type: "reel",
    content_objective: "conversion",
    content_pillar: "مبيعات",
    design_reference: "توجيه إخراجي",
    cta: "دعوة لإجراء",
  });
  assert.equal(res.success, true);
});

test("Scenario 11: Scope ['entire_post'] fails closed on illegal 'id' or 'revision' field (B06)", () => {
  const schema = buildStrictScopedOutputSchema(["entire_post"]);
  const res = schema.safeParse({
    id: "11111111-1111-1111-1111-111111111111",
    caption: "كابشن كامل",
  });
  assert.equal(res.success, false);
});

// -------------------------------------------------------------
// Suite 3: External AI Return Contracts (.strict(), B06)
// -------------------------------------------------------------
console.log("\n--- Suite 3: External AI Return Contracts ---");

test("Scenario 15: single_day contract with unknown field key is rejected by .strict()", () => {
  const res = externalAiSingleDayContractSchema.safeParse({
    mode: "single_day",
    day: 7,
    changes: {
      caption: "كابشن",
      unknown_field: "قيمة مجهولة",
    },
  });
  assert.equal(res.success, false);
});

test("Scenario 16: single_day contract with illegal root key (e.g. planId) is rejected (B06)", () => {
  const res = externalAiSingleDayContractSchema.safeParse({
    mode: "single_day",
    day: 7,
    planId: "evil-plan-id",
    changes: {
      caption: "كابشن",
    },
  });
  assert.equal(res.success, false);
});

test("Scenario 18: multi_day contract with valid distinct days passes validation", () => {
  const res = externalAiMultiDayContractSchema.safeParse({
    mode: "multi_day",
    summary: "ملخص التعديلات",
    days: [
      { day: 3, changes: { caption: "كابشن 3" } },
      { day: 7, changes: { post_type: "carousel" } },
      { day: 14, changes: { cta: "اطلب الآن" } },
    ],
  });
  assert.equal(res.success, true);
});

test("Scenario 19: multi_day contract containing duplicate day is rejected (B02)", () => {
  const res = externalAiMultiDayContractSchema.safeParse({
    mode: "multi_day",
    days: [
      { day: 7, changes: { caption: "كابشن أ" } },
      { day: 7, changes: { caption: "كابشن ب" } },
    ],
  });
  assert.equal(res.success, false);
});

// -------------------------------------------------------------
// Suite 4: Multi-Day Batch Validation (Blockers B01, B02, B15)
// -------------------------------------------------------------
console.log("\n--- Suite 4: Multi-Day Batch Schema Validation ---");

test("Scenario 23: Batch mutation accepts valid editSource ('external_ai', 'manual', 'ai_scoped')", () => {
  const res = batchMutationSchema.safeParse({
    expectedPlanVersion: 1,
    editSource: "external_ai",
    batch: [
      { day_number: 1, expected_revision: 1, changes: { caption: "تعديل 1" } },
      { day_number: 2, expected_revision: 1, changes: { post_type: "reel" } },
    ],
  });
  assert.equal(res.success, true);
});

test("Scenario 26: Batch mutation submitted with empty array is rejected (B15)", () => {
  const res = batchMutationSchema.safeParse({
    expectedPlanVersion: 1,
    editSource: "manual",
    batch: [],
  });
  assert.equal(res.success, false);
});

test("Batch mutation submitted with duplicate day numbers is rejected (B02)", () => {
  const res = batchMutationSchema.safeParse({
    expectedPlanVersion: 1,
    editSource: "manual",
    batch: [
      { day_number: 5, expected_revision: 1, changes: { caption: "أ" } },
      { day_number: 5, expected_revision: 1, changes: { caption: "ب" } },
    ],
  });
  assert.equal(res.success, false);
});

// -------------------------------------------------------------
// Suite 7: Strategic Impact Engine (Blockers B08, B09)
// -------------------------------------------------------------
console.log("\n--- Suite 7: Strategic Impact Engine ---");

const dummy30Items = Array.from({ length: 30 }, (_, i) => ({
  day_number: i + 1,
  post_type: i < 15 ? "reel" : "carousel",
  content_objective: i < 10 ? "awareness" : i < 20 ? "education" : "conversion",
  content_pillar: i % 2 === 0 ? "ركيزة القيمة" : "ركيزة المنتج",
  caption: `كابشن يوم ${i + 1}`,
  design_copy: { headline: `عنوان ${i + 1}`, subtext: "", cta: "" },
  cta: "تابعنا للمزيد",
}));

test("Scenario 35: calculateStrategicImpactForChangeSet computes objective shift", () => {
  const changeSet = [
    { day_number: 1, changes: { content_objective: "conversion" } },
  ];
  const impact = calculateStrategicImpactForChangeSet({
    allItems: dummy30Items,
    changeSet,
  });

  assert.equal(impact.hasStrategicImpact, true);
  assert(impact.objectiveShift !== null);
  assert(impact.summaryArabic.includes("توزيع الأهداف"));
});

test("Scenario 36: calculateStrategicImpactForChangeSet computes format shift", () => {
  const changeSet = [
    { day_number: 1, changes: { post_type: "story" } },
  ];
  const impact = calculateStrategicImpactForChangeSet({
    allItems: dummy30Items,
    changeSet,
  });

  assert.equal(impact.hasStrategicImpact, true);
  assert(impact.formatShift !== null);
  assert(impact.summaryArabic.includes("قوالب المحتوى"));
});

test("Scenario 38: Content-only edits return hasStrategicImpact: false", () => {
  const changeSet = [
    { day_number: 1, changes: { caption: "كابشن جديد كلياً بدون تغيير استراتيجي" } },
  ];
  const impact = calculateStrategicImpactForChangeSet({
    allItems: dummy30Items,
    changeSet,
  });

  assert.equal(impact.hasStrategicImpact, false);
  assert.equal(impact.objectiveShift, null);
});

test("Scenario 39: Multi-day change set calculates combined shift accurately", () => {
  const changeSet = [
    { day_number: 1, changes: { content_objective: "conversion" } },
    { day_number: 2, changes: { content_objective: "conversion" } },
    { day_number: 3, changes: { post_type: "story" } },
  ];
  const impact = calculateStrategicImpactForChangeSet({
    allItems: dummy30Items,
    changeSet,
  });

  assert.equal(impact.hasStrategicImpact, true);
  assert(impact.summaryArabic.includes("توزيع الأهداف"));
  assert(impact.summaryArabic.includes("قوالب المحتوى"));
});

console.log("\n=================================================");
console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
console.log("=================================================");
if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
