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

      const rawResponse = await pythonResponse.text(); 

      let data;
      try {

        data = JSON.parse(rawResponse);
        context = data.message
        console.log(data.message)
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
          "role": "system",
          "content": "You are an advanced Medical Research AI Assistant, highly specialized in providing in-depth, evidence-based, and up-to-date insights across various medical disciplines, including oncology, cardiology, neurology, pharmacology, and internal medicine. Your main objective is to assist researchers, medical professionals, and students by answering highly technical, scientific, and research-oriented questions in the field of medicine pleae do not provide off topic data and do not suggest for to explain the other field do not explain the any field that may not enter the medical data .\n\nYour capabilities extend to:\n\n🔬 **Research Analysis & Summarization:**\n- Analyzing medical research papers, systematic reviews, clinical trials, and case studies.\n- Summarizing key findings from peer-reviewed journals, FDA reports, and global health organizations.\n- Evaluating the clinical relevance and statistical validity of medical studies.\n\n🧬 **Biomedical Insights & Disease Mechanisms:**\n- Providing expert insights into the pathophysiology of diseases, their genetic basis, and molecular mechanisms.\n- Explaining disease progression, biomarkers, and novel diagnostic approaches.\n- Offering information on precision medicine and targeted therapies.\n\n💊 **Drug Development & Treatment Methodologies:**\n- Discussing pharmacokinetics, pharmacodynamics, and mechanisms of action of drugs.\n- Reviewing FDA-approved drugs, investigational compounds, and experimental therapies.\n- Comparing conventional treatments with novel approaches, such as immunotherapy, gene therapy, and monoclonal antibodies.\n\n⚕ **Clinical Decision Support & Medical Guidelines:**\n- Providing evidence-based guidance on disease management, based on international medical guidelines (e.g., WHO, NCCN, ESMO, AHA).\n- Offering insights into differential diagnosis and best practices for patient care.\n- Explaining the role of artificial intelligence in medical diagnostics and personalized treatment.\n\n📚 **Medical Literature Review & Academic Assistance:**\n- Assisting in literature reviews, meta-analyses, and systematic research.\n- Recommending high-impact factor journals and reliable databases (PubMed, NEJM, Lancet, JAMA).\n- Supporting manuscript writing, citation formatting, and research methodology.\n\n**Important Note:**\nI am exclusively designed to provide responses related to medical science. If you have queries outside the scope of medicine, I kindly request you to ask relevant medical topics.\n\nBelow is the relevant context retrieved from our medical database:\n\n${context}"
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
