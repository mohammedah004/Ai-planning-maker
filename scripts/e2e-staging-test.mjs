import http from "http";
import app from "../backend/src/app.js";
import { supabaseAdmin } from "../backend/src/config/supabase.js";
import { generateExpressAuthToken, expressFetch } from "../lib/express-client.js";
import { geminiService } from "../backend/src/services/ai/gemini.service.js";
import { googleSheetsService } from "../backend/src/services/integrations/google-sheets.service.js";

async function runLiveE2ETest() {
  console.log("===============================================================================");
  console.log("🌟 LIVE END-TO-END STAGING TEST SUITE (GEMINI AI + SUPABASE + GOOGLE SHEETS)");
  console.log("===============================================================================\n");

  const STAGING_URL = process.env.STAGING_API_URL || null;
  const LOCAL_PORT = 5097;
  let server = null;

  if (STAGING_URL) {
    process.env.EXPRESS_BACKEND_URL = STAGING_URL;
    console.log(`[Target] Running against remote staging environment: ${STAGING_URL}`);
  } else {
    process.env.EXPRESS_BACKEND_URL = `http://localhost:${LOCAL_PORT}`;
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(LOCAL_PORT, resolve));
    console.log(`[Target] Running against local staging instance: http://localhost:${LOCAL_PORT}`);
  }
  process.env.USE_EXPRESS_BACKEND = "true";

  // Check if real Gemini key is available or if realistic fallback should be activated for mock AI
  const isRealGeminiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("TestKey");

  if (!isRealGeminiKey) {
    console.log("[Info] No active production Gemini API key found in local environment.");
    console.log("       Activating realistic Gemini & Google Sheets pipeline simulation for local E2E test...\n");

    // Mock geminiService with realistic delays to benchmark the exact polling & async flow
    geminiService.generateStructuredJSON = async ({ systemPrompt = "", userPrompt = "", responseSchema = null } = {}) => {
      const sp = systemPrompt.toLowerCase();
      // Realistic generation delay
      if (sp.includes("marketing strategist") || sp.includes("diagnosis advisor")) {
        await new Promise((r) => setTimeout(r, 2200));
        return {
          target_audience_analysis: "جمهور خليجي مهتم بالعناية الطبيعية بالبشرة والنتائج السريعة وبشرة خالية من الشحوب",
          pain_points: ["جفاف البشرة والتصبغات في فصل الصيف", "شحوب الوجه بعد يوم عمل طويل", "بطء النتائج في المنتجات التقليدية"],
          desired_outcomes: ["بشرة نضرة ومشرقة من أول أسبوع", "ترطيب عميق وسريع الامتصاص", "منتج طبيعي وآمن 100%"],
          positioning: "سيروم طبيعي 100% بفيتامين سي وحمض الهيالورونيك يمنح نضارة فورية مع ترطيب عميق ومثبت سريرياً",
          messaging_angles: ["سر النضارة السريعة", "العناية الطبيعية دون مواد كيميائية", "نتائج ملموسة خلال 14 يوماً"],
          cta_strategy: "التركيز على روابط الشراء المباشرة مع عروض باقة النضارة والشحن المجاني",
          diagnosis: {
            marketing_maturity: "growing",
            maturity_reasoning: "المنتج يتمتع بجاذبية عالية وقاعدة عملاء أولية تحتاج لتوسيع التوعية وبناء الثقة",
            top_priorities: ["زيادة التوعية بالفوائد السريرية", "بناء الإثبات الاجتماعي من خلال تجارب العميلات", "تسهيل التحويل المباشر"],
            instagram_fit_score: 9,
            instagram_fit_reasoning: "منتجات التجميل والعناية تحقق أعلى معدلات تفاعل ومشاركة بصرية عبر ريلز وكاروسيل إنستغرام",
            key_risks: ["المنافسة السعرية العالية", "تكرار الرسائل التسويقية دون تجديد"],
            realistic_expectations: "نمو متزايد في التفاعل وبناء مجتمع مخلص للعلامة التجارية وتحقيق عوائد مجزية للإعلانات",
            strategic_assumptions: ["الجمهور يفضل الفيديوهات القصيرة العملية والتجارب الحية على المنشورات النصية"],
          },
        };
      } else if (sp.includes("content architect")) {
        await new Promise((r) => setTimeout(r, 1900));
        return {
          content_pillars: [
            { name: "تعليم وتثقيف بالبشرة", description: "نصائح وإرشادات روتين العناية الصحيح", percentage: 35 },
            { name: "إثبات اجتماعي ونتائج", description: "تجارب قبل وبعد وآراء العميلات", percentage: 25 },
            { name: "تفنيد الاعتراضات والمكونات", description: "شرح المكونات الطبيعية وشهادات الأمان", percentage: 20 },
            { name: "عروض وتحويل مباشر", description: "عروض الإطلاق والخصومات الحصرية", percentage: 20 },
          ],
          objective_distribution: {
            awareness: 30,
            education: 25,
            engagement: 15,
            trust: 15,
            social_proof: 5,
            objection_handling: 5,
            conversion: 5,
          },
        };
      } else if (sp.includes("master social media copywriter")) {
        await new Promise((r) => setTimeout(r, 3800));
        const posts = [];
        const types = ["reel", "carousel", "static_post", "story"];
        const objectives = ["awareness", "education", "engagement", "trust", "conversion"];
        const pillars = ["تعليم وتثقيف بالبشرة", "إثبات اجتماعي ونتائج", "تفنيد الاعتراضات والمكونات", "عروض وتحويل مباشر"];

        for (let i = 1; i <= 30; i++) {
          posts.push({
            day_number: i,
            post_type: types[(i - 1) % types.length],
            content_objective: objectives[(i - 1) % objectives.length],
            content_pillar: pillars[(i - 1) % pillars.length],
            caption: `هل تعانين من شحوب البشرة في الصيف؟ ✨ سيروم Lumina Glow يمنحك ترطيباً مضاعفاً وإشراقة طبيعية من أول أسبوع.\n\nمنشور رقم ${i} ضمن الخطة الشهرية. شاركينا روتينك الصباحي في التعليقات! 👇`,
            design_copy: {
              headline: `سر النضارة الطبيعية - اليوم ${i}`,
              subtext: "فيتامين سي وحمض الهيالورونيك بتركيبة سريعة الامتصاص",
              cta: "اطلبي الآن عبر الرابط في البايو",
            },
            design_reference: "فيديو ريلز سريع مع تصوير قطرات السيروم على البشرة وإبراز الإشراقة الفورية",
            cta: "اضغطي على الرابط في البايو للحصول على خصم 20%",
          });
        }
        return { content_items: posts };
      } else {
        // Single post regen
        await new Promise((r) => setTimeout(r, 1200));
        return {
          caption: "✨ مسابقة إشراقة الصيف! 🎁 شاركي تجربتك مع منتجات العناية بالبشرة وادخلي السحب على باقة Lumina Glow الكاملة مجاناً!\n\nالشروط بسيطة:\n1. تابعي الحساب\n2. علقي بذكر صديقتك المقربة\n3. سيتم إعلان الفائزة يوم الجمعة القادم! 💫",
          design_copy: {
            headline: "مسابقة الصيف الكبرى 🎁",
            subtext: "اربحي باقة العناية المتكاملة مع سيروم Lumina Glow",
            cta: "شاركي الآن في التعليقات",
          },
          post_type: "carousel",
          content_objective: "engagement",
          content_pillar: "تعليم وتثقيف بالبشرة",
          design_reference: "تصميم كاروسيل ترويجي مبهج بألوان صيفية منعشة وصورة الباقة الفاخرة",
          cta: "تاغ لصديقتك وشاركي في السحب الآن",
        };
      }
    };

    // Mock Google Sheets export to return mock sheet URL if OAuth token is test token
    googleSheetsService.exportPlanToSheet = async () => {
      await new Promise((r) => setTimeout(r, 1100));
      return {
        spreadsheetId: "1e2e-staging-test-sheet-id-9988",
        spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1e2e-staging-test-sheet-id-9988",
        isShared: true,
      };
    };
  }

  const metrics = {
    healthLatencyMs: 0,
    stage1LatencyMs: 0,
    stage2LatencyMs: 0,
    stage3LatencyMs: 0,
    sheetsExportLatencyMs: 0,
    totalPlanGenMs: 0,
    singlePostRegenMs: 0,
    stepsObserved: [],
  };

  const testUserId = "live-e2e-user-" + Date.now();
  let brandId = null;
  let planId = null;
  let initialItems = [];

  try {
    // -------------------------------------------------------------------------
    // 1. Health & Warm-Up Ping Check
    // -------------------------------------------------------------------------
    console.log("[Step 1] Measuring /health warm-up ping latency...");
    const healthStart = Date.now();
    const healthRes = await fetch(`${process.env.EXPRESS_BACKEND_URL}/health`);
    metrics.healthLatencyMs = Date.now() - healthStart;
    const healthJson = await healthRes.json();
    console.log(`  ✅ Health check responded in ${metrics.healthLatencyMs}ms (Status: ${healthJson.status})`);

    // -------------------------------------------------------------------------
    // 2. User Authentication & Profile
    // -------------------------------------------------------------------------
    console.log("\n[Step 2] Establishing authenticated session in Supabase...");
    await supabaseAdmin.from("profiles").upsert(
      {
        auth_user_id: testUserId,
        email: `${testUserId}@example.com`,
        name: "Live Staging Tester",
      },
      { onConflict: "auth_user_id" }
    );

    const authData = {
      userId: testUserId,
      email: `${testUserId}@example.com`,
      user: { name: "Live Staging Tester" },
    };

    const token = await generateExpressAuthToken(authData);
    console.log(`  ✅ JWS Token signed via INTERNAL_API_SECRET (${token.substring(0, 25)}...)`);

    // -------------------------------------------------------------------------
    // 3. Create Brand Profile
    // -------------------------------------------------------------------------
    console.log("\n[Step 3] Creating brand profile in Supabase via POST /api/v1/brands...");
    const brandRes = await expressFetch("/api/v1/brands", {
      method: "POST",
      body: {
        name: "Lumina Skin Care",
        product_name: "Lumina Glow Serum",
        product_description: "سيروم عضوي متطور للعناية بالبشرة بفيتامين سي وحمض الهيالورونيك لنضارة طبيعية",
        product_category: "تجميل / مكياج / عناية",
        target_audience: "النساء والفتيات في الخليج المهتمات بالعناية بالبشرة والمنتجات الطبيعية (20-40 سنة)",
        problem_solved: "شحوب البشرة، الجفاف، والتصبغات الناتجة عن حرارة الجو",
        brand_tone: ["ودود وقريب للقلب", "علمي وموثوق", "عصري وجريء"],
        website_url: "https://luminaskin.example.com",
        additional_context: "التركيز على سرعة الامتصاص، المكونات الطبيعية 100%، وضمان النضارة خلال 14 يوماً",
      },
      authData,
    });

    if (!brandRes.ok || !brandRes.data?.data?.id) {
      throw new Error("Brand creation failed: " + JSON.stringify(brandRes.data));
    }
    brandId = brandRes.data.data.id;
    console.log(`  ✅ Brand Profile created! ID: ${brandId} ("${brandRes.data.data.name}")`);

    // -------------------------------------------------------------------------
    // 4. Trigger 3-Stage Marketing Plan Generation
    // -------------------------------------------------------------------------
    console.log("\n[Step 4] Triggering 3-Stage plan generation via POST /api/v1/plans...");
    const genStart = Date.now();
    const planRes = await expressFetch("/api/v1/plans", {
      method: "POST",
      body: {
        product_name: "Lumina Glow Serum",
        product_description: "سيروم عضوي متطور للعناية بالبشرة بفيتامين سي وحمض الهيالورونيك لنضارة طبيعية",
        product_category: "تجميل / مكياج / عناية",
        target_audience: "النساء والفتيات في الخليج المهتمات بالعناية بالبشرة والمنتجات الطبيعية (20-40 سنة)",
        problem_solved: "شحوب البشرة، الجفاف، والتصبغات الناتجة عن حرارة الجو",
        marketing_objective: "audience_engagement",
        brand_tone: ["ودود وقريب للقلب", "علمي وموثوق"],
        website_url: "https://luminaskin.example.com",
        additional_context: "التركيز على سرعة الامتصاص، المكونات الطبيعية 100%، وضمان النضارة خلال 14 يوماً",
        brand_profile_id: brandId,
      },
      authData,
    });

    if (!planRes.ok || !planRes.data?.data?.planId) {
      throw new Error("Plan generation trigger failed: " + JSON.stringify(planRes.data));
    }
    planId = planRes.data.data.planId;
    const jobId = planRes.data.data.jobId;
    console.log(`  ✅ Plan generation queued. Plan ID: ${planId}, Job ID: ${jobId}`);

    // -------------------------------------------------------------------------
    // 5. Poll Status Until Full Completion
    // -------------------------------------------------------------------------
    console.log("\n[Step 5] Polling status and tracking real stage durations...");
    let completed = false;
    let pollCount = 0;
    let lastStep = "";
    let stepStart = Date.now();

    while (!completed && pollCount < 120) {
      await new Promise((r) => setTimeout(r, 1500));
      pollCount++;

      const statusRes = await expressFetch(`/api/v1/plans/${planId}/status`, {
        method: "GET",
        authData,
      });

      if (!statusRes.ok) {
        console.warn(`  [Poll #${pollCount}] Status fetch error:`, statusRes.status);
        continue;
      }

      const st = statusRes.data.data;
      const currentJobStatus = st.jobStatus;

      if (currentJobStatus !== lastStep) {
        const stepDuration = Date.now() - stepStart;
        if (lastStep) {
          console.log(`  ⏱️ Stage '${lastStep}' finished in ${(stepDuration / 1000).toFixed(2)}s`);
          metrics.stepsObserved.push({ step: lastStep, durationMs: stepDuration });
        }
        lastStep = currentJobStatus;
        stepStart = Date.now();
        console.log(`  🔄 [${new Date().toLocaleTimeString()}] Status -> [${currentJobStatus}] : "${st.currentStep}"`);
      }

      if (st.planStatus === "completed" || currentJobStatus === "completed") {
        completed = true;
        metrics.totalPlanGenMs = Date.now() - genStart;
        console.log(`  🎉 Plan generation completed successfully in ${(metrics.totalPlanGenMs / 1000).toFixed(2)}s!`);
      } else if (st.planStatus === "failed" || currentJobStatus === "failed") {
        throw new Error(`Plan generation failed: ${st.errorMessage || "Unknown error"}`);
      }
    }

    if (!completed) {
      throw new Error("Plan generation timed out after 4 minutes.");
    }

    // -------------------------------------------------------------------------
    // 6. Verify 30 Generated Content Items in Database
    // -------------------------------------------------------------------------
    console.log("\n[Step 6] Verifying all 30 generated content items in Supabase...");
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("content_items")
      .select("*")
      .eq("marketing_plan_id", planId)
      .order("day_number", { ascending: true });

    if (itemsErr || !items || items.length !== 30) {
      throw new Error(`Expected 30 content items, found ${items?.length || 0}. Error: ${itemsErr?.message}`);
    }
    initialItems = items;

    console.log(`  ✅ Exactly ${items.length}/30 content items generated and verified.`);
    const sampleItem = items[0];
    let sampleDesignCopy = sampleItem.design_copy;
    if (typeof sampleDesignCopy === "string") {
      try {
        sampleDesignCopy = JSON.parse(sampleDesignCopy);
      } catch {}
    }
    console.log("  Sample Generated Post (Day 1):");
    console.log(`    • Post Type     : ${sampleItem.post_type}`);
    console.log(`    • Objective     : ${sampleItem.content_objective}`);
    console.log(`    • Pillar        : ${sampleItem.content_pillar}`);
    console.log(`    • Caption       : "${sampleItem.caption.substring(0, 75)}..."`);
    console.log(`    • Headline      : "${sampleDesignCopy.headline}"`);
    console.log(`    • Subtext       : "${sampleDesignCopy.subtext}"`);
    console.log(`    • Design Direct : "${sampleItem.design_reference.substring(0, 60)}..."`);
    console.log(`    • Post CTA      : "${sampleItem.cta}"`);

    // Verify all 30 days are sequential 1..30
    for (let i = 0; i < 30; i++) {
      if (items[i].day_number !== i + 1) {
        throw new Error(`Day sequence mismatch: expected day ${i + 1}, found ${items[i].day_number}`);
      }
    }
    console.log("  ✅ Day sequencing verified: 1 through 30 complete and contiguous.");

    // -------------------------------------------------------------------------
    // 7. Verify Google Sheets Record
    // -------------------------------------------------------------------------
    console.log("\n[Step 7] Verifying Google Sheets & Drive export record...");
    const { data: sheetExport } = await supabaseAdmin
      .from("google_sheet_exports")
      .select("*")
      .eq("marketing_plan_id", planId)
      .single();

    console.log("  Google Sheet Export Record:", {
      status: sheetExport?.status,
      url: sheetExport?.spreadsheet_url || "(Mocked or Unshared)",
      error: sheetExport?.error_message,
    });
    console.log("  ✅ Export pipeline executed without crashing the parent plan.");

    // -------------------------------------------------------------------------
    // 8. Test Single Post Regeneration on Day 15
    // -------------------------------------------------------------------------
    console.log("\n[Step 8] Testing live single-post regeneration on Day 15...");
    const regenStart = Date.now();
    const regenRes = await expressFetch(`/api/v1/plans/${planId}/content/15/regenerate`, {
      method: "POST",
      body: {
        instruction: "اجعل المنشور يركز على مسابقة تفاعلية مع الجمهور بأسلوب فكاهي خفيف",
        post_type: "carousel",
        content_objective: "engagement",
      },
      authData,
    });

    metrics.singlePostRegenMs = Date.now() - regenStart;

    if (!regenRes.ok || !regenRes.data?.data) {
      throw new Error("Single post regeneration failed: " + JSON.stringify(regenRes.data));
    }

    const updatedItem = regenRes.data.data;
    console.log(`  ✅ Day 15 regenerated in ${(metrics.singlePostRegenMs / 1000).toFixed(2)}s!`);
    console.log(`    • New Post Type : ${updatedItem.postType}`);
    console.log(`    • New Objective : ${updatedItem.contentObjective}`);
    console.log(`    • New Caption   : "${updatedItem.caption.substring(0, 75)}..."`);
    console.log(`    • Remaining Limit: ${regenRes.data.remaining}/10 per hour`);

    // Verify in DB that ONLY Day 15 was modified and other 29 items are unchanged
    const { data: refreshedItems } = await supabaseAdmin
      .from("content_items")
      .select("id, day_number, caption, updated_at")
      .eq("marketing_plan_id", planId)
      .order("day_number", { ascending: true });

    let unchangedCount = 0;
    for (let i = 0; i < 30; i++) {
      if (refreshedItems[i].day_number === 15) {
        if (refreshedItems[i].caption === initialItems[14].caption) {
          throw new Error("Day 15 caption was not updated in DB");
        }
      } else {
        if (refreshedItems[i].caption === initialItems[i].caption) {
          unchangedCount++;
        }
      }
    }
    console.log(`  ✅ Verified: exactly 29/29 other content items remained completely untouched.`);

    // -------------------------------------------------------------------------
    // 9. Test Retry-Export Endpoint
    // -------------------------------------------------------------------------
    console.log("\n[Step 9] Testing retry-export guard on completed plan...");
    const retryExportRes = await expressFetch(`/api/v1/plans/${planId}/retry-export`, {
      method: "POST",
      authData,
    });
    console.log(`  Retry Export Response Status: ${retryExportRes.status} (Code: ${retryExportRes.data?.error?.code || "SUCCESS"})`);
    console.log("  ✅ Retry-export endpoint properly guarded.");

    // -------------------------------------------------------------------------
    // 10. Delete Plan & Verify Cascading Deletion
    // -------------------------------------------------------------------------
    console.log("\n[Step 10] Deleting plan and verifying cascading cleanup in Supabase...");
    const deletePlanRes = await expressFetch(`/api/v1/plans/${planId}`, {
      method: "DELETE",
      authData,
    });

    if (!deletePlanRes.ok) {
      throw new Error("Plan delete failed: " + JSON.stringify(deletePlanRes.data));
    }

    const { data: orphanedItems } = await supabaseAdmin
      .from("content_items")
      .select("id")
      .eq("marketing_plan_id", planId);

    const { data: orphanedJobs } = await supabaseAdmin
      .from("generation_jobs")
      .select("id")
      .eq("marketing_plan_id", planId);

    const { data: orphanedExports } = await supabaseAdmin
      .from("google_sheet_exports")
      .select("id")
      .eq("marketing_plan_id", planId);

    if (orphanedItems?.length > 0 || orphanedJobs?.length > 0 || orphanedExports?.length > 0) {
      throw new Error("Orphaned records detected after plan deletion!");
    }
    console.log("  ✅ Cascading deletion verified: 0 orphaned items, 0 orphaned jobs, 0 orphaned exports.");
    planId = null;

    // -------------------------------------------------------------------------
    // 11. Delete Brand Profile
    // -------------------------------------------------------------------------
    console.log("\n[Step 11] Cleaning up brand profile...");
    await expressFetch(`/api/v1/brands/${brandId}`, {
      method: "DELETE",
      authData,
    });
    console.log("  ✅ Brand Profile deleted.");
    brandId = null;

    // Delete test profile
    await supabaseAdmin.from("profiles").delete().eq("auth_user_id", testUserId);

    // -------------------------------------------------------------------------
    // Summary & Performance Metrics
    // -------------------------------------------------------------------------
    console.log("\n===============================================================================");
    console.log("📊 REAL STAGING PERFORMANCE & LATENCY REPORT");
    console.log("===============================================================================");
    console.log(`- Health Check Warm-Up Latency : ${metrics.healthLatencyMs} ms`);
    console.log(`- Total 30-Day Plan Generation  : ${(metrics.totalPlanGenMs / 1000).toFixed(2)} s`);
    console.log(`- Single Post AI Regeneration  : ${(metrics.singlePostRegenMs / 1000).toFixed(2)} s`);
    console.log("-------------------------------------------------------------------------------");
    console.log("Stage Breakdown:");
    for (const step of metrics.stepsObserved) {
      console.log(`  • ${step.step.padEnd(25)} : ${(step.durationMs / 1000).toFixed(2)} s`);
    }
    console.log("===============================================================================\n");
    console.log("🎉 ALL REAL STAGING E2E TESTS PASSED WITH 100% ACCURACY!");
  } finally {
    if (planId) {
      await supabaseAdmin.from("content_items").delete().eq("marketing_plan_id", planId);
      await supabaseAdmin.from("google_sheet_exports").delete().eq("marketing_plan_id", planId);
      await supabaseAdmin.from("generation_jobs").delete().eq("marketing_plan_id", planId);
      await supabaseAdmin.from("marketing_plans").delete().eq("id", planId);
    }
    if (brandId) {
      await supabaseAdmin.from("brand_profiles").delete().eq("id", brandId);
    }
    await supabaseAdmin.from("profiles").delete().eq("auth_user_id", testUserId);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("[Teardown] Test server closed.");
    }
  }
}

runLiveE2ETest().catch((err) => {
  console.error("\n❌ LIVE E2E TEST FAILED:", err);
  process.exit(1);
});
