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
    const { url } = await req.json();
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

    // 1. Fetch HTML
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let visibleText = "";
    try {
      const siteRes = await fetch(formattedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ProspectBot/1.0)" },
      });
      const html = await siteRes.text();
      // 2. Clean HTML → visible text
      visibleText = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);
    } catch {
      visibleText = `Could not fetch content from ${formattedUrl}. Analyze based on the domain name alone.`;
    }

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
            content: `You are an SDR doing research on a company.
Input: Raw text scraped from the company's website.
Task:
- Extract 3 concise, high-value insights about the company's focus, strategy, or priorities.
- Write 1 personalized conversation starter that references those insights.
- Write 1 sentence explaining why this matters to them.
Keep everything short, specific, and non-salesy.`,
          },
          {
            role: "user",
            content: `Here is the raw text scraped from ${formattedUrl}:\n\n${visibleText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "prospect_snapshot",
              description: "Return 3 key insights, a conversation starter, and why it matters",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exactly 3 key company insights as strings",
                  },
                  conversationStarter: {
                    type: "string",
                    description: "A natural, non-salesy conversation opener referencing specific details",
                  },
                  whyItMatters: {
                    type: "string",
                    description: "One sentence about why now is a good time to reach out",
                  },
                },
                required: ["insights", "conversationStarter", "whyItMatters"],
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
      // 4. Return exact format: { insights, conversationStarter, whyItMatters }
      return new Response(JSON.stringify({
        insights: result.insights,
        conversationStarter: result.conversationStarter,
        whyItMatters: result.whyItMatters,
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
