import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { ChromaClient } from "chromadb";

dotenv.config();

const chromaClient = new ChromaClient({ path: "<Your Chroma instance IP>", port: 8000 });
chromaClient.heartbeat();
const WEB_COLLECTION = `WEB_SCAPED_DATA_COLLECTION-1`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const scrapeWebAppInfo = async (url = "") => {
  try {
    const { data } = await axios.get(url);
    if (!data) throw new Error(`Empty response from ${url}`);

    const $ = cheerio.load(data);
    const pageHead = $("head").html() || "";
    const pageBody = $("body").html() || "";

    const internalLinks = new Set();
    const externalLinks = new Set();

    $("a").each((_, element) => {
      const link = $(element).attr("href");
      if (!link || link === "/") return;
      if (link.startsWith("http")) {
        externalLinks.add(link);
      } else {
        internalLinks.add(new URL(link, url).href);
      }
    });

    return {
      head: pageHead,
      body: pageBody,
      internalLinks: Array.from(internalLinks),
      externalLinks: Array.from(externalLinks),
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { head: "", body: "", internalLinks: [], externalLinks: [] };
  }
};

const generateVectorEmbeddings = async (text) => {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    console.warn("Empty or invalid text for embedding.");
    return null;
  }
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  return embedding.data[0].embedding;
};

async function ingest(url = "", depth = 2) {
  if (depth === 0) return;
  try {
    console.log(`Ingesting ${url}`);
    const { head, body, internalLinks } = await scrapeWebAppInfo(url);
    
    const headEmbedding = await generateVectorEmbeddings(head);
    if (headEmbedding) {
      await insertIntoDb({ embedding: headEmbedding, url, head });
    }

    const bodyChunks = chunkText(body, 1000);
    for (const chunk of bodyChunks) {
      const bodyEmbedding = await generateVectorEmbeddings(chunk);
      if (bodyEmbedding) {
        await insertIntoDb({ embedding: bodyEmbedding, url, head, body: chunk });
      }
    }

    for (const link of internalLinks) {
      await ingest(link, depth - 1);
    }
    console.log(`Ingested ${url} successfully`);
  } catch (error) {
    console.error("Error inserting into database for", url, error);
  }
}

async function insertIntoDb({ embedding, url, body = "", head = "" }) {
  const collection = await chromaClient.getOrCreateCollection({ name: WEB_COLLECTION });
  await collection.add({
    ids: [url],
    embeddings: [embedding],
    metadatas: [{ url, body, head }],
  });
}

const AIChatBot = async (question = "") => {
  const questionEmbeddings = await generateVectorEmbeddings(question);
  if (!questionEmbeddings) {
    console.warn("Invalid question input for AIChatBot.");
    return;
  }

  const collection = await chromaClient.getOrCreateCollection({ name: WEB_COLLECTION });
  const collectionResult = await collection.query({ nResults: 3, queryEmbeddings: questionEmbeddings });
  
  const metadatas = collectionResult.metadatas?.[0] || [];
  const body = metadatas.map(meta => meta?.body).filter(Boolean);
  const urls = metadatas.map(meta => meta?.url).filter(Boolean);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are an AI support agent. Provide support based on page content." },
      { role: "user", content: `Query: ${question}\nRelevant URLs: ${urls.join(", ")}\nExtracted Context:\n${body.join("\n\n")}` },
    ],
  });

  console.log({ messages: response.choices[0].message.content, url: urls[0] });
};

// Ensure the scraper runs
scrapeWebAppInfo(process.env.SCRAPE_URL);

function chunkText(text, size) {
  if (!text || typeof text !== "string") return [];
  const sentences = text.match(/[^\.\!?]+[\.\!?]+/g) || [text];
  let chunks = [];
  let chunk = "";

  for (let sentence of sentences) {
    if ((chunk + sentence).length > size) {
      chunks.push(chunk.trim());
      chunk = "";
    }
    chunk += sentence + " ";
  }
  if (chunk.trim()) chunks.push(chunk.trim());
  return chunks;
}
