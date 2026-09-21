import http from 'http';
import app from '../src/app.js';
import { requestAnalyzer } from '../src/services/requestAnalyzer.service.js';
import { modelRouter } from '../src/services/modelRouter.service.js';
import { responseJudge } from '../src/services/responseJudge.service.js';
import { providerRegistry } from '../src/services/ai/providerRegistry.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 Starting Koko AI Backend Test Suite...\n');

  // 1. Request Analyzer Tests
  console.log('1. Testing Request Analyzer Service:');
  const codeAnalysis = requestAnalyzer.analyze('Write a TypeScript function to sort an array');
  assert(codeAnalysis.intent === 'coding', 'Correctly identifies coding intent');

  const debugAnalysis = requestAnalyzer.analyze('Fix this error: Uncaught TypeError Cannot read properties of undefined');
  assert(debugAnalysis.intent === 'debugging', 'Correctly identifies debugging intent');

  const imageAnalysis = requestAnalyzer.analyze('Generate an image of a cybernetic tiger');
  assert(imageAnalysis.intent === 'image_generation', 'Correctly identifies image generation intent');
  assert(imageAnalysis.requiresImageGeneration === true, 'Sets requiresImageGeneration flag');

  const videoAnalysis = requestAnalyzer.analyze('Create a video clip of a soaring eagle');
  assert(videoAnalysis.intent === 'video_generation', 'Correctly identifies video generation intent');

  // 2. Model Router Tests
  console.log('\n2. Testing Model Router Service:');
  const imgRoute = modelRouter.selectProvider('image_generation', 'low');
  assert(imgRoute.provider === 'gemini' && imgRoute.method === 'generateImage', 'Routes image generation to Gemini');

  const fastRoute = modelRouter.selectProvider('general_question', 'low');
  assert(fastRoute.provider === 'groq', 'Routes low-complexity general question to Groq for speed');

  const complexRoute = modelRouter.selectProvider('coding', 'high');
  assert(complexRoute.candidateModels.length > 1, 'Prepares multi-model consensus for high complexity tasks');

  // 3. Response Judge Tests
  console.log('\n3. Testing Response Judge Service:');
  const mockOutcomes = [
    {
      status: 'success',
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      latencyMs: 320,
      result: { content: '```typescript\nconst a = 1;\n```\nDetailed architectural explanation with bullet points.' },
      error: null,
    },
    {
      status: 'success',
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      latencyMs: 120,
      result: { content: 'Short answer.' },
      error: null,
    },
    {
      status: 'failed',
      provider: 'openrouter',
      model: 'anthropic/claude-3.7-sonnet',
      latencyMs: 1500,
      result: null,
      error: 'Rate limit exceeded',
    },
  ];

  const verdict = responseJudge.judge('Write TypeScript code and architectural explanation', mockOutcomes);
  assert(verdict.winner === 'gemini', 'Response judge identifies highest quality response');
  assert(verdict.score > 0.8, 'Assigns high quality score to winning response');
  assert(verdict.evaluatedModels.length === 3, 'Returns telemetry for all 3 models');
  assert(verdict.evaluatedModels.find((m) => m.provider === 'openrouter').status === 'failed', 'Accurately records failed model status');

  // 4. Provider Registry Tests
  console.log('\n4. Testing Provider Registry:');
  const geminiCaps = providerRegistry.getCapabilities('gemini');
  assert(geminiCaps.text === true && geminiCaps.image === true, 'Gemini capabilities include text and image');

  const groqCaps = providerRegistry.getCapabilities('groq');
  assert(groqCaps.text === true && groqCaps.image === false, 'Groq capabilities accurately declared');

  // 5. HTTP Endpoint Tests using ephemeral server
  console.log('\n5. Testing HTTP Server & Middleware:');
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;

  try {
    // Health Check
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthData.service === 'koko-ai-server' && healthData.status === 'healthy', 'Health check returns expected payload');

    // Unauthorized Access Test
    const unauthRes = await fetch(`http://localhost:${port}/api/conversations`);
    const unauthData = await unauthRes.json();
    assert(unauthRes.status === 401, 'Protected route rejects unauthenticated request with 401');
    assert(unauthData.error?.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

    // 404 Catch-All Test
    const notFoundRes = await fetch(`http://localhost:${port}/api/non-existent-endpoint`);
    const notFoundData = await notFoundRes.json();
    assert(notFoundRes.status === 404, 'Unknown route returns 404');
    assert(notFoundData.error?.code === 'NOT_FOUND', 'Error code is NOT_FOUND');
  } finally {
    testServer.close();
  }

  console.log(`\n🏁 Test Results: ${passed} Passed, ${failed} Failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
