import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// ── Schema ────────────────────────────────────────────────────────────────────
// NOTE: Gemini does NOT support z.literal() / z.discriminatedUnion() — it
// rejects schemas that emit a JSON "const" field.  Instead we use a single
// flat Question schema where every possible field is optional, and the LLM
// fills in only the relevant subset based on the `type` field.

const QuestionSchema = z.object({
  type: z.enum(['mcq', 'coding', 'scenario']).describe(
    'The question type: "mcq" for multiple choice, "coding" for a coding problem, "scenario" for a scenario-based question'
  ),
  id: z.string().describe('Unique question id, e.g. "q1", "q2"'),
  question: z.string().describe('The question text'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
  topic: z.string().describe('The technical topic this question covers'),
  // MCQ-only fields
  options: z.array(z.string()).optional().describe('For MCQ only: exactly 4 answer options'),
  correctAnswer: z.string().optional().describe('For MCQ only: the correct option text'),
  // Coding-only fields
  language: z.string().optional().describe('For coding only: the programming language'),
  starterCode: z.string().optional().describe('For coding only: starter/boilerplate code'),
  expectedOutput: z.string().optional().describe('For coding only: expected output description'),
  testCases: z.array(z.object({
    input: z.string().describe('The string representation of the input parameters. e.g. "[1,2,3], 5"'),
    expectedOutput: z.string().describe('The expected return value or printed output'),
    isHidden: z.boolean().describe('True if this is a hidden test case')
  })).optional().describe('For coding only: EXACTLY 4 test cases (2 public, 2 hidden) to evaluate the code'),
  // Scenario-only fields
  context: z.string().optional().describe('For scenario only: the professional context / situation'),
});

export const TestSchema = z.object({
  testTitle: z.string().describe('Descriptive title for the test, e.g. "Senior React Developer Assessment"'),
  jobRole: z.string().describe('The specific job title'),
  totalMarks: z.number().describe('Total marks (MCQ=5pts, Coding=15pts, Scenario=10pts each)'),
  estimatedDurationMinutes: z.number().describe('Estimated time in minutes (3min/MCQ, 15min/coding, 7min/scenario)'),
  questions: z.array(QuestionSchema).describe('The list of all test questions'),
});

export type Question = z.infer<typeof QuestionSchema>;
export type GeneratedTest = z.infer<typeof TestSchema>;

// ── Prompt ────────────────────────────────────────────────────────────────────

const TEST_PROMPT = PromptTemplate.fromTemplate(`
You are an expert technical hiring manager and test designer.
Your task is to generate a customized, adaptive technical assessment for a candidate based on their resume and the job they are applying for.

CANDIDATE RESUME DATA:
{resume_json}

TARGET JOB DESCRIPTION:
{job_description}

INSTRUCTIONS:
1. Analyze the candidate's skills, experience, and education against the job requirements.
2. Generate a test with EXACTLY 8 questions:
   - 4 questions with type="mcq": multiple choice, core technical knowledge. Each must have exactly 4 options and a correctAnswer.
   - 2 questions with type="coding": coding problems in the most relevant language from the resume. Include starterCode, expectedOutput, and EXACTLY 4 testCases (set isHidden=false for the first 2, and isHidden=true for the last 2).
   - 2 questions with type="scenario": soft skills / real-world decision making. Include a realistic professional context string.
3. Questions should be adaptive — increase difficulty based on the candidate's claimed experience level.
4. Each question must have a unique id like "q1", "q2", ... "q8".
5. Set testTitle to something descriptive, e.g. "Senior React Developer Assessment".
6. totalMarks = (number of MCQs × 5) + (number of coding × 15) + (number of scenarios × 10).
7. Estimate estimatedDurationMinutes = (MCQs × 3) + (coding × 15) + (scenarios × 7).
`);

// ── Generator Function ────────────────────────────────────────────────────────

export const generateAdaptiveTest = async (
  resumeData: Record<string, any>,
  jobDescription: string
): Promise<GeneratedTest> => {
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxRetries: 2,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const structuredLlm = llm.withStructuredOutput(TestSchema);
  const chain = TEST_PROMPT.pipe(structuredLlm);

  const result = await chain.invoke({
    resume_json: JSON.stringify(resumeData, null, 2),
    job_description: jobDescription,
  });

  return result;
};
