// @ts-ignore
const pdfParse = require('pdf-parse');


import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Define the structured output schema we expect from the LLM
export const resumeSchema = z.object({
  skills: z.array(z.string()).describe("List of technical and soft skills extracted from the resume."),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    year: z.string().optional()
  })).describe("List of educational qualifications."),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).describe("List of notable projects mentioned."),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    highlights: z.array(z.string())
  })).describe("Work experience history.")
});

export type ParsedResume = z.infer<typeof resumeSchema>;

export const parseResumeFromBuffer = async (buffer: Buffer): Promise<{ parsedData: ParsedResume; rawText: string }> => {
  // 1. Extract text from PDF buffer
  const pdfData = await pdfParse(buffer);
  const rawText = pdfData.text;

  if (!rawText || rawText.trim() === '') {
    throw new Error("Could not extract text from the PDF.");
  }

  // 2. Setup LangChain LLM (Google Gemini)
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    maxRetries: 2,
    apiKey: process.env.GEMINI_API_KEY,
  });


  // Use the LLM's built-in structured output capability
  const structuredLlm = llm.withStructuredOutput(resumeSchema);

  // 3. Define the Prompt Template
  const prompt = PromptTemplate.fromTemplate(`
    You are an expert HR AI Assistant. Your task is to extract structured information from the following resume text.
    
    Resume Text:
    {resume_text}
    
    Extract the candidate's skills, education, projects, and work experience. 
    Ensure the output strictly follows the requested schema. If some information is missing, use empty arrays or omit optional fields.
  `);

  // 4. Run the chain
  const chain = prompt.pipe(structuredLlm);
  
  const result = await chain.invoke({
    resume_text: rawText
  });

  return {
    parsedData: result,
    rawText
  };
};
