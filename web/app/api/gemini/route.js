import { streamText, Message } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { initialMessage } from "libs/data";

// Initialize the Google Generative AI client with your API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Specify runtime for edge deployment (optional, for Next.js)
export const runtime = "edge";

// Utility function to generate unique IDs for messages
const generateId = () => Math.random().toString(36).slice(2, 15);

// Transform incoming messages into the format expected by the API
const buildGoogleGenAIPrompt = (messages) => [
  {
    id: generateId(),
    role: "user",
    content: initialMessage.content, // Assumes initialMessage is defined in "@/lib/data"
  },
  ...messages.map((message) => ({
    id: message.id || generateId(),
    role: message.role,
    content: message.content,
  })),
];

// Handle POST requests to the API
export async function POST(request) {
  const { messages } = await request.json(); // Extract messages from the request body
  console.log("Messages: ", messages);

  // Stream the response from the Google Generative AI API
  const stream = await streamText({
    model: google("gemini-1.5-pro"), // Use a valid model name
    messages: buildGoogleGenAIPrompt(messages),
    temperature: 0.7, // Adjust creativity of responses (0 to 1)
  });

  return stream?.toDataStreamResponse(); // Return the streamed response
}