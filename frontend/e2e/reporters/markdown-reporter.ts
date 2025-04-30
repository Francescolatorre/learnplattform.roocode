import {Reporter, TestCase, TestResult} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A custom reporter that generates Markdown reports for Markdown-related tests
 */
class MarkdownReporter implements Reporter {
    private markdownContent: string = '';
    private testResults: {name: string; status: string; duration: number; error?: string}[] = [];

    onBegin() {
        this.markdownContent = `# Markdown Test Results\n\n`;
        this.markdownContent += `*Generated on ${new Date().toLocaleString()}*\n\n`;
        this.markdownContent += `## Test Summary\n\n`;
    }

    onTestEnd(test: TestCase, result: TestResult) {
        // Only process markdown-related tests
        if (!test.title.toLowerCase().includes('markdown')) {
            return;
        }

        const status = result.status;
        const duration = result.duration;

        let error = '';
        if (result.status === 'failed' && result.errors.length > 0) {
            error = result.errors[0].message || 'Unknown error';
        }

        this.testResults.push({
            name: test.title,
            status: status,
            duration,
            error
        });
    }

    onEnd() {
        // Skip if no markdown tests were run
        if (this.testResults.length === 0) {
            return;
        }

        // Calculate statistics
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.status === 'passed').length;
        const failed = this.testResults.filter(r => r.status === 'failed').length;
        const skipped = this.testResults.filter(r => r.status === 'skipped').length;

        this.markdownContent += `- **Total Tests**: ${total}\n`;
        this.markdownContent += `- **Passed**: ${passed}\n`;
        this.markdownContent += `- **Failed**: ${failed}\n`;
        this.markdownContent += `- **Skipped**: ${skipped}\n\n`;

        // Add test details
        this.markdownContent += `## Test Details\n\n`;
        this.markdownContent += `| Test | Status | Duration (ms) |\n`;
        this.markdownContent += `| ---- | ------ | ------------ |\n`;

        for (const test of this.testResults) {
            const emoji = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
            this.markdownContent += `| ${test.name} | ${emoji} ${test.status} | ${test.duration} |\n`;
        }

        // Add error details if any test failed
        if (failed > 0) {
            this.markdownContent += `\n## Error Details\n\n`;

            for (const test of this.testResults.filter(r => r.status === 'failed')) {
                this.markdownContent += `### ${test.name}\n\n`;
                this.markdownContent += '```\n';
                this.markdownContent += test.error || 'No error message available';
                this.markdownContent += '\n```\n\n';
            }
        }

        // Write to file
        const reportDir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, {recursive: true});
        }

        fs.writeFileSync(path.join(reportDir, 'markdown-test-results.md'), this.markdownContent);
        console.log('LLM-friendly test results written to test-results/markdown-test-results.md');
    }
}

export default MarkdownReporter;
