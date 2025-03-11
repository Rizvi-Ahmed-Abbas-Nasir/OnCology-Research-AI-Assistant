import { NextResponse } from "next/server";

interface Message {
  role: string;
  content: string;
}

interface RequestPayload {
  messages: Message[];
  model?: string;
}

const pythonServerUrl = "http://localhost:8000";

export async function POST(req: Request): Promise<Response> {
  try {
    const { messages, model }: RequestPayload = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: "No messages provided or invalid format" },
        { status: 400 }
      );
    }

    const query = messages[messages.length - 1]?.content || "";
    let context = "";

    try {
      const pythonResponse = await fetch(`${pythonServerUrl}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 3 }),
      });

      const rawResponse = await pythonResponse.text(); // Read raw text first

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (jsonError) {
        throw new Error(`Invalid JSON response from Python API: ${rawResponse}`);
      }

      if (!pythonResponse.ok) {
        throw new Error(data.error || "Python API Error");
      }

      if (Array.isArray(data.documents)) {
        console.log("Received Documents:", data.documents);
        context = data.documents
          .map((doc: any) => `${doc.title}\n${doc.abstract}`)
          .join("\n\n");
      } else if (data.message) {
        console.warn("Server Message:", data.message);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching data from Python API:", error);
    }

    const payload = {
      model: model || "llama3.2",
      messages: [
        {
          role: "system",
          content: `You are an advanced Oncology Research AI Assistant, specialized in providing in-depth, evidence-based, and up-to-date insights on oncology. Your primary role is to assist researchers, medical professionals, and students by answering technical, scientific, and research-based queries in the field of oncology.

Key Capabilities:
- Summarizing and analyzing oncology research papers, clinical trials, and medical studies.
- Providing insights on cancer biology, treatment methodologies, drug developments, and emerging technologies in oncology.
- Assisting with literature reviews, reference suggestions, and critical evaluations of oncology-related topics.
- Generating embeddings and retrieving relevant research papers from a database for enhanced research assistance.
- Answering educational and technical questions related to cancer diagnosis, prognosis, therapies (chemotherapy, immunotherapy, targeted therapy), and precision medicine.

Below is relevant context from our database:\n\n${context}`,
        },
        ...messages,
      ],
    };

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.body) {
      throw new Error("Ollama API response does not contain a body.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const jsonLine = JSON.parse(line);
            if (jsonLine.message?.content) {
              assistantContent += jsonLine.message.content.replace(/\*\*/g, "");
            }
          } catch (err) {
            console.error("Error parsing JSON line:", err, line);
          }
        }
      }
    }

    return NextResponse.json({
      role: "assistant",
      content: assistantContent,
    });
  } catch (error: unknown) {
    console.error("[API ERROR]:", error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
