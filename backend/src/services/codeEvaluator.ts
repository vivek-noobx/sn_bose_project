import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const EvaluationSchema = z.object({
  results: z.array(z.object({
    passed: z.boolean(),
    actualOutput: z.string(),
    error: z.string().optional()
  }))
});

export type EvaluationResult = z.infer<typeof EvaluationSchema>;

const EVAL_PROMPT = PromptTemplate.fromTemplate(`
You are an expert compiler and runtime environment simulator.
Your task is to evaluate the following code submission against a set of test cases.

Language: {language}

Code:
\`\`\`
{code}
\`\`\`

Test Cases (JSON format):
{testCases}

INSTRUCTIONS:
1. Act as a runtime environment for the specified language.
2. For EACH test case, mentally execute the code with the given 'input'.
3. Compare your execution result with the 'expectedOutput'.
4. If the code throws a syntax error or runtime error, set 'passed' to false and provide the error message in 'error'.
5. If the output matches exactly, set 'passed' to true. Otherwise, set it to false.
6. Provide the actual output that the code produced in 'actualOutput'.
7. The order of results MUST exactly match the order of the test cases provided.
`);

export const evaluateCodeWithAI = async (
  code: string,
  language: string,
  testCases: Array<{ input: string, expectedOutput: string }>
): Promise<EvaluationResult> => {
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-3.7-flash',
    temperature: 0.1, // Low temperature for deterministic evaluation
    maxRetries: 2,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const structuredLlm = llm.withStructuredOutput(EvaluationSchema);
  const chain = EVAL_PROMPT.pipe(structuredLlm);

  const result = await chain.invoke({
    language: language,
    code: code,
    testCases: JSON.stringify(testCases, null, 2),
  });

  return result;
};
