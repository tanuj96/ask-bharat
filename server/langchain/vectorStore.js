import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Document } from "@langchain/core/documents";

const embeddings = new OllamaEmbeddings({
  model: "mistral",
  baseUrl: "http://localhost:11434",
  timeout: 30000
});

// Create isolated collection for each chatbot
const getCollectionName = (chatbotId) => `chatbot_${chatbotId.replace(/-/g, "_")}`;

export const createChromaStore = async (chatbotId) => {
  try {
    const collectionName = getCollectionName(chatbotId);
    const vectorStore = new Chroma(embeddings, {
      collectionName,
      url: "http://localhost:5005"
    });

    // Initialize collection if needed
    try {
      await vectorStore.ensureCollection();
      console.log(`✅ ChromaDB collection ${collectionName} ready`);
    } catch (error) {
      console.warn(`⚠️ Initializing collection ${collectionName}...`);
      await vectorStore.addDocuments([
        new Document({
          pageContent: "init",
          metadata: { chatbot_id: chatbotId, is_init: true }
        })
      ]);
      // Clean up initialization document
      await vectorStore.delete({ ids: ["init"] });
    }

    return vectorStore;
  } catch (error) {
    console.error("❌ ChromaDB connection failed:", error);
    throw error;
  }
};

export const queryVectorStore = async (query, k = 3, chatbotId) => {
  try {
    const vectorStore = await createChromaStore(chatbotId);
    
    // Current working solution - query without filters
    const results = await vectorStore.similaritySearch(query, k);
    
    // Manual filtering by chatbot_id (fallback)
    const filteredResults = results.filter(doc => 
      doc.metadata.chatbot_id === chatbotId
    );

    console.log('Query results:', {
      query,
      totalResults: results.length,
      filteredResults: filteredResults.length,
      firstResult: filteredResults[0]?.pageContent?.substring(0, 50) + '...'
    });

    return filteredResults;
  } catch (error) {
    console.error("❌ Vector store query failed:", {
      error: error.message,
      stack: error.stack
    });
    return [];
  }
};

export const addDocumentToStore = async (text, chatbotId, metadata = {}) => {
  try {
    const vectorStore = await createChromaStore(chatbotId);
    
    await vectorStore.addDocuments([
      new Document({
        pageContent: text,
        metadata: {
          chatbot_id: chatbotId, // Consistent metadata field
          owner_id: String(metadata.ownerId || ''),
          created_at: new Date().toISOString(),
          ...metadata
        }
      })
    ]);

    console.log('Document added successfully for chatbot:', chatbotId);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to add document:", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};