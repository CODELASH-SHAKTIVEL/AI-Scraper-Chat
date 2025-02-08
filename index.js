import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
dotenv.config();

import { ChromaClient } from "chromadb";
const chromaClient = new ChromaClient({
  path: "<Your Chroma instance IP>",
  port: 8000,
});
chromaClient.heartbeat();
const WEB_COLLECTION = `WEB_SCAPED_DATA_COLLECTION-1`;

const openai = new OpenAI(process.env.OpenAI_API_Key);

const scrapewebappinfo = async (url = "") => {
  const { data } = await axios.get(url);
  console.log(data);
  const $ = cheerio.load(data);

  const pageHead = $("head").html();
  const pageBody = $("body").html();

  const internalLinks = new Set();
  const externalLinks = new Set();

  $("a").each((_, element) => {
    const link = $(element).attr("href");
    if (!link || link === "/") {
      console.log("no link");
      return;
    }
    if (link.startsWith("http") || link.startsWith("https")) {
      externalLinks.add(link);
    } else {
      internalLinks.add(link);
    }
  });

  return {
    head: pageHead,
    body: pageBody,
    internalLinks: Array.from(internalLinks),
    externalLinks: Array.from(externalLinks),
  };
};

const generatevectorEmbeddings = async ({ text }) => {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  return embedding.data[0].embedding;
};

async function ingest(url = "") {
  try {
    console.log(`Ingesting ${url}`);
    const { head, body, internalLinks } = await scrapeWebsite(url);
    const headEmbedding = await generatevectorEmbeddings({ text: head });
    insertIntoDb({ embedding: headEmbedding, url });
    const bodyChunks = chunkText(body, 1000);
    for (const chunk of bodyChunks) {
      const bodyEmbedding = await generatevectorEmbeddings({ text: chunk });
      await insertIntoDb({ embedding: bodyEmbedding, url, head, body: chunk });
    }
  
    for (const link of internalLinks) {
      const _url = `${url}${link}`;
      ingest(_url);
    }
  
    console.log(`Ingested ${url} successfully`);
  } catch (error) {
    throw new Error('Could not insert into database for ' + url)
  }
}

async function insertIntoDb({ embedding, url, body = "", head = "" }) {
  const collection = await chromaClient.getOrCreateCollection({
    name: WEB_COLLECTION,
  });

  await collection.add({
    ids: [url],
    embeddings: [embedding],
    metadatas: [{ url, body, head }],
  });
}

scrapewebappinfo(process.env.Scrape_URL);

function chunkText(text, size) {
  if (!text || typeof text !== "string") {
    return [];
  }
  if (!size || typeof size !== "number" || size <= 0) {
    return [];
  }

  const words = text.split(/\s+/); // Split text into words
  let chunks = [];
  let chunk = [];
  let tokenCount = 0;

  for (let word of words) {
    let wordTokens = word.length; // Approximate token count by word length
    if (tokenCount + wordTokens > size) {
      chunks.push(chunk.join(" "));
      chunk = [];
      tokenCount = 0;
    }
    chunk.push(word);
    tokenCount += wordTokens;
  }
  if (chunk.length > 0) {
    chunks.push(chunk.join(" "));
  }

  return chunks;
}
