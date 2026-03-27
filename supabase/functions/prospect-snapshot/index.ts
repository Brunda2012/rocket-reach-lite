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
Task:
- Infer a company profile: industry, estimated company size, top keywords, and brand tone/voice.
- Extract structured signals: hiring signals, tech stack, strategic initiatives, pain points, and growth indicators.
- Identify recent changes: anything that appears new, changing, or recently updated — product launches, leadership changes, rebrand, new partnerships, policy shifts, recent blog posts, events, or announcements. Look for dates, "new", "announcing", "introducing", "just launched", "coming soon", etc.
- Extract 3 concise, high-value insights about the company's focus, strategy, or priorities.
- Write 4 personalized conversation starters, each tailored to a specific persona: CTO, CEO, Head of Operations, and Head of Sales. Each should reference relevant signals for that role.
- Write 1 sentence explaining why this matters to them.
- Assign a confidence score (0–100) based on how complete and reliable the extracted information is. Consider: how much content was available, how specific the signals are, whether data came from multiple pages, and whether key sections (about, careers, blog) were present. 90+ = rich multi-page data with clear signals. 60-89 = decent data but some gaps. Below 60 = sparse or generic content.
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
              description: "Return structured signals, insights, a conversation starter, and why it matters",
              parameters: {
                type: "object",
                properties: {
                  companyProfile: {
                    type: "object",
                    description: "Inferred company profile from website content",
                    properties: {
                      industry: { type: "string", description: "Primary industry or sector" },
                      companySize: { type: "string", description: "Estimated size: Startup, SMB, Mid-Market, or Enterprise" },
                      keywords: { type: "array", items: { type: "string" }, description: "5-8 keywords that define the company" },
                      tone: { type: "string", description: "Brand voice/tone in 2-3 words, e.g. 'Technical & Developer-focused'" },
                    },
                    required: ["industry", "companySize", "keywords", "tone"],
                    additionalProperties: false,
                  },
                  signals: {
                    type: "object",
                    description: "Structured business signals extracted from the website",
                    properties: {
                      hiringSignals: {
                        type: "array",
                        items: { type: "string" },
                        description: "Hiring trends, open roles, team expansion signals",
                      },
                      techStack: {
                        type: "array",
                        items: { type: "string" },
                        description: "Technologies, tools, platforms mentioned or inferred",
                      },
                      strategicInitiatives: {
                        type: "array",
                        items: { type: "string" },
                        description: "Key strategic moves, partnerships, product launches",
                      },
                      painPoints: {
                        type: "array",
                        items: { type: "string" },
                        description: "Challenges, problems, or friction areas inferred from content",
                      },
                      growthIndicators: {
                        type: "array",
                        items: { type: "string" },
                        description: "Funding, revenue milestones, expansion, market signals",
                      },
                    },
                    required: ["hiringSignals", "techStack", "strategicInitiatives", "painPoints", "growthIndicators"],
                    additionalProperties: false,
                  },
                  recentChanges: {
                    type: "array",
                    items: { type: "string" },
                    description: "Things that appear new, changing, or recently updated — product launches, leadership changes, new partnerships, announcements, events, rebrands",
                  },
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exactly 3 key company insights as strings",
                  },
                  conversationStarters: {
                    type: "object",
                    description: "4 conversation starters tailored to specific personas",
                    properties: {
                      cto: { type: "string", description: "Conversation starter for a CTO — focus on tech, architecture, engineering" },
                      ceo: { type: "string", description: "Conversation starter for a CEO — focus on strategy, growth, vision" },
                      headOfOperations: { type: "string", description: "Conversation starter for Head of Operations — focus on efficiency, process, scale" },
                      headOfSales: { type: "string", description: "Conversation starter for Head of Sales — focus on pipeline, revenue, market expansion" },
                    },
                    required: ["cto", "ceo", "headOfOperations", "headOfSales"],
                    additionalProperties: false,
                  },
                  whyItMatters: {
                    type: "string",
                    description: "One sentence about why now is a good time to reach out",
                  },
                  confidenceScore: {
                    type: "number",
                    description: "0-100 score reflecting how complete and reliable the extracted data is",
                  },
                },
                required: ["companyProfile", "signals", "recentChanges", "insights", "conversationStarters", "whyItMatters", "confidenceScore"],
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
      return new Response(JSON.stringify({
        companyProfile: result.companyProfile,
        signals: result.signals,
        recentChanges: result.recentChanges,
        insights: result.insights,
        conversationStarters: result.conversationStarters,
        whyItMatters: result.whyItMatters,
        confidenceScore: result.confidenceScore,
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
