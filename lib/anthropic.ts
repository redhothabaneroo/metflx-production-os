import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type ParsedConcept = {
  code: string;
  title: string;
  concept: string;
  focus: string;
  reference: string;
  talent: string;
  notes: string[];
  questions: string[];
  shots: string[];
};

const SYSTEM_PROMPT = `You extract structured video-shoot concepts from a video production studio's content plan document (pasted as plain text from a Google Doc). The doc lists one or more numbered concepts, each typically with a code (e.g. "BSQ01"), a title, a "Concept" paragraph, a "Focus" line, a "Reference" URL, bulleted "Notes", and sometimes a "Shot List" (numbered, each shot with a short framing label and a description) and/or interview "Questions" for talent appearing on camera.

Extract every concept in the document, in the order they appear. For each concept, record:
- code: its short code if the doc has one, else an empty string.
- title: its title.
- concept: the full "Concept" description paragraph, else an empty string.
- focus: the "Focus" line, else an empty string.
- reference: the reference URL or note, else an empty string. If the reference says something like "N/A (Original Concept)", use an empty string.
- talent: who appears on camera, if stated, else an empty string.
- notes: one string per bullet under "Notes", in order. Empty array if none.
- questions: one string per interview question/prompt meant to be asked to talent, if any are listed. Empty array if none.
- shots: one string per shot list item, in order, keeping each shot's short framing label and its description together as a single natural sentence (e.g. "The door opening reveal — captures a grand, welcoming entrance..."). Empty array if the doc has no shot list for that concept (e.g. "Shot List: N/A").

Do not invent content that isn't in the document. Do not merge multiple concepts into one or split one concept into multiple.`;

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "record_concepts",
  description: "Record the structured concepts extracted from the content plan document.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      concepts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            code: { type: "string" },
            title: { type: "string" },
            concept: { type: "string" },
            focus: { type: "string" },
            reference: { type: "string" },
            talent: { type: "string" },
            notes: { type: "array", items: { type: "string" } },
            questions: { type: "array", items: { type: "string" } },
            shots: { type: "array", items: { type: "string" } },
          },
          required: ["code", "title", "concept", "focus", "reference", "talent", "notes", "questions", "shots"],
          additionalProperties: false,
        },
      },
    },
    required: ["concepts"],
    additionalProperties: false,
  },
};

export async function extractConcepts(rawText: string): Promise<ParsedConcept[]> {
  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "record_concepts" },
    messages: [{ role: "user", content: rawText }],
  });

  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return structured concepts.");

  const { concepts } = toolUse.input as { concepts: ParsedConcept[] };
  if (!Array.isArray(concepts) || !concepts.length) throw new Error("No concepts found in that text.");
  return concepts;
}
