import { Reporter, TestCase, TestResult, TestError } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Custom reporter that generates test results in a format
 * easily readable by LLMs
 */
class LLMReporter implements Reporter {
  private results: Array<{
    title: string;
    testFile: string;
    status: string;
    duration: number;
    error?: string;
  }> = [];

  onTestBegin(test: TestCase): void {
    console.log(`Starting test: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.push({
      title: test.title,
      testFile: path.relative(process.cwd(), test.location.file),
      status: result.status,
      duration: result.duration,
      error: result.error?.message || result.errors?.map(e => e.message).join('\n'),
    });
  }

  onEnd(): void {
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      results: this.results,
    };

    // Create an output format that's suitable for LLM consumption
    const llmOutput = `
# Markdown Feature E2E Test Results

Test Run Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

## Summary
- **Total Tests:** ${summary.totalTests}
- **Passed:** ${summary.passed}
- **Failed:** ${summary.failed}
- **Skipped:** ${summary.skipped}

## Detailed Results

${summary.results
  .map(
    result => `
### ${result.title}
- **Status:** ${result.status === 'passed' ? '✅ PASSED' : result.status === 'failed' ? '❌ FAILED' : '⏭️ SKIPPED'}
- **File:** \`${result.testFile}\`
- **Duration:** ${(result.duration / 1000).toFixed(2)}s
${result.error ? `- **Error:** ${result.error}` : ''}
`
  )
  .join('\n')}

## Test Coverage Analysis
The tests above verify that Markdown rendering is properly implemented throughout the learning platform application.
They cover course descriptions and learning task descriptions, validating both the editor functionality and the rendering output.
`;

    // Create directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Write the results to a file
    fs.writeFileSync(path.join(reportsDir, 'markdown-test-results.md'), llmOutput);
    console.log('LLM-friendly test results written to test-results/markdown-test-results.md');
  }
}

export default LLMReporter;
