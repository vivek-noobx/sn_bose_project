import { generateAdaptiveTest } from './src/services/testGenerator';
import dotenv from 'dotenv';
dotenv.config();

const resume = {
  skills: ['React', 'JavaScript'],
  education: [{ institution: 'NIT', degree: 'B.Tech' }],
  experience: [],
  projects: []
};

async function run() {
  try {
    console.log('Testing test generation with gemini-3.6-flash...');
    const res = await generateAdaptiveTest(resume, 'React developer with 1 year experience');
    console.log('SUCCESS! Test title:', res.testTitle);
    console.log('Number of questions:', res.questions.length);
  } catch (err: any) {
    console.error('FAILED with error:', err);
  }
}

run();

