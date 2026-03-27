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
    const { theme, country, regionCountries } = await req.json();
    if (!theme || typeof theme !== "string" || theme.trim().length === 0) {
      return new Response(JSON.stringify({ error: "theme is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const countryFilter = country && typeof country === "string" ? country.trim() : null;
    const regionList = Array.isArray(regionCountries) ? regionCountries : null;
    const geoHint = countryFilter
      ? `Focus on companies based in or operating primarily in ${countryFilter}.`
      : regionList
        ? `Focus on companies based in these countries: ${regionList.join(", ")}.`
        : "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
            content: `You are a B2B sales research assistant. Given a theme or industry interest, suggest 8 companies that match.${geoHint ? ` ${geoHint}` : ""} Include a mix of well-known leaders and emerging/growing companies. For each company, provide its real name, actual website URL, a one-sentence description, the country it is based in, and a brief reason why it matches the theme. Be factual — only suggest real companies you are confident exist.`,
          },
          {
            role: "user",
            content: `Find companies matching this theme: "${theme.trim()}"${countryFilter ? ` in ${countryFilter}` : regionList ? ` in ${regionList.join(", ")}` : ""}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "discover_companies",
              description: "Return a list of companies matching the given theme",
              parameters: {
                type: "object",
                properties: {
                  companies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Company name" },
                        website: { type: "string", description: "Company website URL" },
                        description: { type: "string", description: "One-sentence company description" },
                        whyItMatches: { type: "string", description: "Why this company matches the theme" },
                        country: { type: "string", description: "Country where the company is headquartered" },
                      },
                      required: ["name", "website", "description", "whyItMatches", "country"],
                      additionalProperties: false,
                    },
                    description: "8 companies matching the theme, mix of established and emerging",
                  },
                },
                required: ["companies"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "discover_companies" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      return new Response(
        JSON.stringify({ error: status === 429 ? "Rate limited, try again shortly." : "AI analysis failed" }),
        { status: status === 429 ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("discover-companies error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
