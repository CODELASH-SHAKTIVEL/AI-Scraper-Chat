import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
dotenv.config();

const openai = new OpenAI(process.env.OpenAI_API_Key);

const scrapewebappinfo = async (url = "") => {
  const { data } = await axios.get(url);
  console.log(data);
  const $ = cheerio.load(data);

  const pageHead = $("head").html();
  const pageBody = $("body").html();

  const internalLinks = [];
  const externalLinks = [];

  $("a").each((_, element) => {
    const link = $(element).attr("href");
    if (!link || link === "/") {
      console.log("no link");
      return;
    }
    if (link.startsWith("http") || link.startsWith("https")) {
      externalLinks.push(link);
    } else {
      internalLinks.push(link);
    }
  });

  return { head: pageHead, body: pageBody, internalLinks, externalLinks };
};

const generatevectorEmbeddings = async ({ text }) => {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  return embedding.data[0].embedding;
};
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

const ingest = async (url = "") => {
  const { head, body, internalLinks, externalLinks } = await scrapewebappinfo(
    url
  );
  const HeadEmbeddings = await generatevectorEmbeddings(head);
  const BodyEmbeddings = await generatevectorEmbeddings(body);
};

scrapewebappinfo(process.env.Scrape_URL);
