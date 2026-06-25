import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schemas for the structured AI evaluation output
const QuestionEvaluationSchema = z.object({
  id: z.string().describe("The question id matching the test, e.g. 'q1'"),
  score: z.number().describe("The score awarded for this question (out of 5 for MCQ, 15 for coding, 10 for scenario)"),
  passed: z.boolean().describe("Whether the answer is correct or satisfies passing criteria"),
  feedback: z.string().describe("Constructive, detailed feedback explaining the grade and what can be improved")
});

export const TestEvaluationSchema = z.object({
  overallScore: z.number().describe("Sum of all scores awarded across all questions"),
  maxScore: z.number().describe("Maximum possible score for the test"),
  questionEvaluations: z.array(QuestionEvaluationSchema).describe("Evaluations for all questions in the test"),
  strengths: z.array(z.string()).describe("3-4 bullet points detailing candidate's strengths shown in the test"),
  weaknesses: z.array(z.string()).describe("3-4 bullet points detailing candidate's gaps or weaknesses"),
  recommendations: z.array(z.string()).describe("3-4 actionable recommendations for candidate's career/skill growth")
});

export type TestEvaluation = z.infer<typeof TestEvaluationSchema>;

const EVAL_PROMPT = PromptTemplate.fromTemplate(`
You are an expert technical interviewer, code reviewer, and skill assessor.
Your task is to evaluate a candidate's responses to a custom technical test.

TARGET JOB ROLE: {job_role}
JOB DESCRIPTION: {job_description}

FULL ASSESSMENT DETAILS (JSON):
{test_json}

CANDIDATE'S RESPONSES (JSON - key is question ID, value is candidate's response):
{answers_json}

PROGRAMMATICALLY GRADED MCQs (Provided for your reference to compile the full report):
{mcq_grades_json}

INSTRUCTIONS:
1. Programmatically graded MCQs are provided. You MUST include them in your final 'questionEvaluations' array exactly as graded (use the same score, passed, and feedback details provided).
2. For each 'coding' question:
   - Evaluate the candidate's code. Assess correctness, code quality, readability, complexity (time/space), and language idiomatic usage.
   - Grade out of 15. If the code is missing or empty, give 0. Give partial credit for partial solutions or good logical structure.
   - Set passed=true if the solution is logically sound and compiles/runs correctly.
3. For each 'scenario' question:
   - Evaluate the candidate's response for technical accuracy, logic, professionalism, and soft-skill appropriateness (communication, project management, etc.).
   - Grade out of 10. If empty, give 0.
   - Set passed=true if the candidate's solution address the core problem effectively.
4. Calculate the overallScore as the sum of all MCQ, coding, and scenario question scores. The maxScore must be the total marks of the test.
5. Generate constructive, professional overall lists for strengths, weaknesses, and actionable recommendations, keeping them specific to the candidate's performance in this test.
`);

export const evaluateAssessment = async (
  test: any,
  answers: Record<string, string>,
  jobRole: string,
  jobDescription: string
): Promise<TestEvaluation> => {
  // 1. Programmatically grade MCQs first to ensure absolute accuracy
  const mcqGrades: any[] = [];
  test.questions.forEach((q: any) => {
    if (q.type === 'mcq') {
      const candidateAnswer = answers[q.id];
      const isCorrect = candidateAnswer?.trim() === q.correctAnswer?.trim();
      mcqGrades.push({
        id: q.id,
        score: isCorrect ? 5 : 0,
        passed: isCorrect,
        feedback: isCorrect 
          ? `Correct. Selected the correct option: "${q.correctAnswer}".`
          : `Incorrect. Selected: "${candidateAnswer || 'None'}". The correct answer is: "${q.correctAnswer}".`
      });
    }
  });

  // 2. Call Gemini to evaluate the rest and package everything
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    temperature: 0.2, // Low temperature for consistent grading
    maxRetries: 2,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const structuredLlm = llm.withStructuredOutput(TestEvaluationSchema);
  const chain = EVAL_PROMPT.pipe(structuredLlm);

  const evaluationResult = await chain.invoke({
    job_role: jobRole,
    job_description: jobDescription,
    test_json: JSON.stringify(test, null, 2),
    answers_json: JSON.stringify(answers, null, 2),
    mcq_grades_json: JSON.stringify(mcqGrades, null, 2)
  });

  return evaluationResult;
};
