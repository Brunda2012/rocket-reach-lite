import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, linkedinUrl } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Build base URL and sub-page paths to scrape
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }
    const baseUrl = formattedUrl.replace(/\/+$/, "");
    const subPaths = ["/about", "/about-us", "/careers", "/jobs", "/blog"];

    function stripHtml(html: string): string {
      return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    async function fetchPage(pageUrl: string): Promise<string> {
      try {
        const res = await fetch(pageUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ProspectBot/1.0)" },
          redirect: "follow",
        });
        if (!res.ok) return "";
        const html = await res.text();
        return stripHtml(html);
      } catch {
        return "";
      }
    }

    // 2. Fetch homepage + sub-pages in parallel
    const [homepageText, ...subTexts] = await Promise.all([
      fetchPage(baseUrl),
      ...subPaths.map((p) => fetchPage(`${baseUrl}${p}`)),
    ]);

    // 3. Merge and deduplicate content, cap at ~12k chars
    const sections: string[] = [];
    if (homepageText) sections.push(`[Homepage]\n${homepageText.slice(0, 4000)}`);
    subPaths.forEach((path, i) => {
      const text = subTexts[i];
      if (text && text.length > 200) {
        sections.push(`[${path.replace("/", "")}]\n${text.slice(0, 3000)}`);
      }
    });

    const visibleText = sections.length > 0
      ? sections.join("\n\n---\n\n").slice(0, 12000)
      : `Could not fetch content from ${formattedUrl}. Analyze based on the domain name alone.`;

    console.log(`Scraped ${sections.length} pages, total ${visibleText.length} chars`);

    // 2b. Optionally fetch LinkedIn page
    let linkedinText = "";
    if (linkedinUrl) {
      let formattedLinkedin = linkedinUrl.trim();
      if (!formattedLinkedin.startsWith("http")) {
        formattedLinkedin = `https://${formattedLinkedin}`;
      }
      const liText = await fetchPage(formattedLinkedin);
      if (liText && liText.length > 100) {
        linkedinText = `\n\n---\n\n[LinkedIn Profile]\n${liText.slice(0, 3000)}`;
        console.log(`LinkedIn content: ${linkedinText.length} chars`);
      }
    }

    const combinedText = (visibleText + linkedinText).slice(0, 14000);

    // 3. Send to LLM with structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an SDR doing deep research on a company.
Input: Raw text scraped from multiple pages of the company's website (homepage, about, careers, blog) and optionally their LinkedIn company page.
Return a structured JSON object with these exact sections:

1. companyOverview — industry, estimated size (Startup/SMB/Mid-Market/Enterprise), 5-8 defining keywords, and brand tone in 2-3 words.
2. strategicSignals — five categories: hiringSignals (open roles, team growth), techStack (technologies used), strategicInitiatives (key moves, launches, partnerships), painPoints (challenges inferred from content), growthIndicators (funding, expansion, revenue signals). Each is an array of concise strings.
3. recentChanges — anything new, changing, or recently updated: product launches, leadership changes, partnerships, announcements, events. Look for dates, "new", "announcing", "just launched", etc.
4. personaStarters — 4 conversation openers each tailored to a persona: CTO (tech/architecture), CEO (strategy/vision), Head of Operations (efficiency/scale), Head of Sales (pipeline/revenue). Plus a whyItMatters sentence.
5. confidenceScore — 0-100 based on data completeness. 90+ = rich multi-page data. 60-89 = decent but gaps. <60 = sparse/generic.
6. suitabilityScore — 0-100 rating of how promising this company is as a prospect. Weight: industry fit & relevance (25%), growth indicators strength (25%), hiring activity level (25%), pain points that suggest need for solutions (25%). 90+ = exceptional prospect. 70-89 = strong. 50-69 = moderate. <50 = weak fit.

Keep everything short, specific, and non-salesy.`,
          },
          {
            role: "user",
            content: `Here is text scraped from multiple pages of ${formattedUrl}${linkedinUrl ? " and their LinkedIn page" : ""}:\n\n${combinedText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "prospect_snapshot",
              description: "Return structured company intelligence as JSON",
              parameters: {
                type: "object",
                properties: {
                  companyOverview: {
                    type: "object",
                    description: "High-level company profile",
                    properties: {
                      industry: { type: "string", description: "Primary industry or sector" },
                      companySize: { type: "string", description: "Startup, SMB, Mid-Market, or Enterprise" },
                      keywords: { type: "array", items: { type: "string" }, description: "5-8 defining keywords" },
                      tone: { type: "string", description: "Brand tone in 2-3 words" },
                    },
                    required: ["industry", "companySize", "keywords", "tone"],
                    additionalProperties: false,
                  },
                  strategicSignals: {
                    type: "object",
                    description: "Structured business signals",
                    properties: {
                      hiringSignals: { type: "array", items: { type: "string" }, description: "Hiring trends, open roles, team expansion" },
                      techStack: { type: "array", items: { type: "string" }, description: "Technologies, tools, platforms" },
                      strategicInitiatives: { type: "array", items: { type: "string" }, description: "Key strategic moves, partnerships, launches" },
                      painPoints: { type: "array", items: { type: "string" }, description: "Challenges or friction areas" },
                      growthIndicators: { type: "array", items: { type: "string" }, description: "Funding, expansion, market signals" },
                    },
                    required: ["hiringSignals", "techStack", "strategicInitiatives", "painPoints", "growthIndicators"],
                    additionalProperties: false,
                  },
                  recentChanges: {
                    type: "array",
                    items: { type: "string" },
                    description: "New or recently updated items — launches, announcements, leadership changes",
                  },
                  personaStarters: {
                    type: "object",
                    description: "Conversation starters per persona plus a summary",
                    properties: {
                      cto: { type: "string", description: "For CTO — tech, architecture, engineering" },
                      ceo: { type: "string", description: "For CEO — strategy, growth, vision" },
                      headOfOperations: { type: "string", description: "For Head of Ops — efficiency, process, scale" },
                      headOfSales: { type: "string", description: "For Head of Sales — pipeline, revenue, expansion" },
                      whyItMatters: { type: "string", description: "One sentence on why now is a good time to reach out" },
                    },
                    required: ["cto", "ceo", "headOfOperations", "headOfSales", "whyItMatters"],
                    additionalProperties: false,
                  },
                  confidenceScore: {
                    type: "number",
                    description: "0-100 data completeness score",
                  },
                  suitabilityScore: {
                    type: "number",
                    description: "0-100 prospect suitability score based on industry fit, growth signals, hiring activity, and pain points",
                  },
                },
                required: ["companyOverview", "strategicSignals", "recentChanges", "personaStarters", "confidenceScore", "suitabilityScore"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "prospect_snapshot" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      // Map new schema to frontend-expected keys for backward compat
      return new Response(JSON.stringify({
        companyProfile: result.companyOverview,
        signals: result.strategicSignals,
        recentChanges: result.recentChanges,
        insights: [], // removed standalone insights; key info now in personaStarters
        conversationStarters: {
          cto: result.personaStarters?.cto,
          ceo: result.personaStarters?.ceo,
          headOfOperations: result.personaStarters?.headOfOperations,
          headOfSales: result.personaStarters?.headOfSales,
        },
        whyItMatters: result.personaStarters?.whyItMatters,
        confidenceScore: result.confidenceScore,
        suitabilityScore: result.suitabilityScore,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("prospect-snapshot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
