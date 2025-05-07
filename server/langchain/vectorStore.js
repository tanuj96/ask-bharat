import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const embeddings = new OllamaEmbeddings({ 
  model: "mistral",
  baseUrl: "http://localhost:11434" 
});

// Updated Chroma client configuration for v2
export const createChromaStore = async () => {
  const vectorStore = new Chroma(embeddings, {
    collectionName: "askbharat-docs",
    url: "http://localhost:5005",
    collectionMetadata: {
      "hnsw:space": "cosine", // or "l2" or "ip" based on your needs
    },
  });

  return vectorStore;
};

export const addDocumentToStore = async (text, metadata = {}) => {
  const vectorStore = await createChromaStore();
  
  // For v2 API, we need to ensure the collection exists first
  try {
    await vectorStore.ensureCollection();
  } catch (err) {
    console.error("Error ensuring collection:", err);
    throw err;
  }

  await vectorStore.addDocuments([
    {
      pageContent: text,
      metadata,
    },
  ]);

  console.log("✅ Embedding saved to Chroma.");
};