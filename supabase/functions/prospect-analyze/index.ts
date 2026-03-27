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
      return new Response(JSON.stringify({ error: "URL is required" }), {
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

    // Fetch the website content
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Fetching URL:", formattedUrl);

    let websiteContent = "";
    try {
      const siteRes = await fetch(formattedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ProspectBot/1.0)" },
      });
      const html = await siteRes.text();
      // Strip HTML tags, scripts, styles to get text content
      websiteContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000); // Limit to ~8k chars
    } catch (fetchErr) {
      console.error("Failed to fetch website:", fetchErr);
      websiteContent = `Could not fetch website content from ${formattedUrl}. Analyze based on the URL/domain name alone.`;
    }

    console.log("Website content length:", websiteContent.length);

    // Send to AI for analysis
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
            content: `You are an expert B2B sales intelligence analyst. Given website content from a prospect company, extract key business insights and generate a personalized conversation starter.

Return ONLY valid JSON in this exact format:
{
  "companyName": "Company Name",
  "summary": "2-3 sentence summary of what the company does and their current focus",
  "insights": [
    {"icon": "trending", "title": "Short Title", "detail": "1-2 sentence insight"},
    {"icon": "users", "title": "Short Title", "detail": "1-2 sentence insight"},
    {"icon": "building", "title": "Short Title", "detail": "1-2 sentence insight"}
  ],
  "conversationStarter": "A natural, non-salesy conversation opener that references specific details from their website",
  "whyItMatters": "1-2 sentences about why now is a good time to reach out based on the signals you found"
}

Icon options: "trending" (growth/funding), "users" (team/hiring), "building" (products/partnerships), "target" (strategy/goals), "lightbulb" (innovation/tech)`,
          },
          {
            role: "user",
            content: `Analyze this company website and generate prospect intelligence.\n\nURL: ${formattedUrl}\n\nWebsite Content:\n${websiteContent}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "prospect_analysis",
              description: "Return structured prospect intelligence",
              parameters: {
                type: "object",
                properties: {
                  companyName: { type: "string" },
                  summary: { type: "string" },
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        icon: { type: "string", enum: ["trending", "users", "building", "target", "lightbulb"] },
                        title: { type: "string" },
                        detail: { type: "string" },
                      },
                      required: ["icon", "title", "detail"],
                    },
                  },
                  conversationStarter: { type: "string" },
                  whyItMatters: { type: "string" },
                },
                required: ["companyName", "summary", "insights", "conversationStarter", "whyItMatters"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "prospect_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ success: true, data: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content as JSON
    const content = aiData.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify({ success: true, data: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("prospect-analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
