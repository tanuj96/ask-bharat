import { ChatOllama } from "@langchain/ollama";

export const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "mistral"
});
