import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

// Ollama embeddings instance
const embeddings = new OllamaEmbeddings({ model: "mistral" });

// Create vector store collection in Chroma server via LangChain
export const createChromaStore = async () => {
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: "askbharat-docs",
    url: "http://localhost:5005",
  });

  return vectorStore;
};

// Add document to Chroma via LangChain
export const addDocumentToStore = async (text, metadata = {}) => {
  const vectorStore = await createChromaStore();

  await vectorStore.addDocuments([
    {
      pageContent: text,
      metadata,
    },
  ]);

  console.log("✅ Embedding saved to Chroma.");
};
