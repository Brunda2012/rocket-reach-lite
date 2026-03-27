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
    const { snapshot, prospectEmail, userTheme } = await req.json();
    if (!snapshot) {
      return new Response(JSON.stringify({ error: "snapshot data is required" }), {
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

    const profile = snapshot.companyProfile || {};
    const signals = snapshot.signals || {};
    const contacts = snapshot.publicContacts || {};

    const contextParts: string[] = [];
    contextParts.push(`Company: ${profile.industry || "Unknown"} industry, ${profile.companySize || "Unknown"} size, tone: ${profile.tone || "professional"}`);
    if (profile.keywords?.length) contextParts.push(`Keywords: ${profile.keywords.join(", ")}`);
    if (signals.painPoints?.length) contextParts.push(`Pain Points: ${signals.painPoints.join("; ")}`);
    if (signals.strategicInitiatives?.length) contextParts.push(`Strategic Initiatives: ${signals.strategicInitiatives.join("; ")}`);
    if (signals.growthIndicators?.length) contextParts.push(`Growth Indicators: ${signals.growthIndicators.join("; ")}`);
    if (signals.hiringSignals?.length) contextParts.push(`Hiring Signals: ${signals.hiringSignals.join("; ")}`);
    if (signals.techStack?.length) contextParts.push(`Tech Stack: ${signals.techStack.join(", ")}`);
    if (snapshot.recentChanges?.length) contextParts.push(`Recent Changes: ${snapshot.recentChanges.join("; ")}`);
    if (snapshot.whyItMatters) contextParts.push(`Why It Matters: ${snapshot.whyItMatters}`);
    if (contacts.emails?.length) contextParts.push(`Public Emails: ${contacts.emails.join(", ")}`);
    if (prospectEmail) contextParts.push(`Personal Prospect Email: ${prospectEmail}`);
    if (userTheme) contextParts.push(`User's Interest/Theme: ${userTheme}`);

    const companyContext = contextParts.join("\n");

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
            content: `You are an expert SDR and outreach strategist. You craft highly personalized, warm, credible cold emails that get replies.

Rules:
- Subject line: short, specific, non-salesy, curiosity-driven
- Intro: reference 1-2 specific insights about the company (recent changes, initiatives, growth)
- Value hypothesis: tie to the company's strategy or pain points — show you understand their world
- Soft CTA: suggest a conversation, not a hard sell
- If a personal prospect email is provided, add subtle personalization (but don't be creepy)
- Tone: warm, credible, concise — like a peer, not a vendor
- Keep the email under 150 words
- Use the user's interest/theme to frame relevance if provided`,
          },
          {
            role: "user",
            content: `Generate a personalized outreach email for this company:\n\n${companyContext}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "outreach_email",
              description: "Return a structured outreach email",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Email subject line — short, specific, non-salesy" },
                  emailBody: { type: "string", description: "Full email body with personalized intro, value hypothesis, and soft CTA" },
                  recommendedRecipient: { type: "string", description: "Best email to send to — personal email if provided, otherwise best public email" },
                  reasoning: { type: "string", description: "1-2 sentences explaining why this email fits the company" },
                  relevanceScore: { type: "number", description: "0-100 score of how relevant and likely to get a reply this email is" },
                },
                required: ["subject", "emailBody", "recommendedRecipient", "reasoning", "relevanceScore"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "outreach_email" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
    console.error("generate-outreach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
