/**
 * Script to run Markdown E2E tests
 *
 * Usage:
 * node run-markdown-tests.js [type]
 *
 * Where type is one of:
 * - all (default): Run all Markdown tests
 * - editor: Run only Markdown editor tests
 * - task: Run only learning task Markdown tests
 * - course: Run only course Markdown tests
 */

import {execSync} from 'child_process';
import {resolve, dirname} from 'path';
import {fileURLToPath} from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the test type from command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';

// Map test type to file pattern
const testPatterns = {
    all: 'markdown-*.spec.ts',
    editor: 'markdown-editor.spec.ts',
    task: 'markdown-task.spec.ts',
    course: 'markdown-course.spec.ts'
};

const pattern = testPatterns[testType] || testPatterns.all;

console.log(`Running Markdown tests: ${testType} (${pattern})`);

try {
    // Run the Playwright test command
    execSync(`npx playwright test ${pattern} --project=chromium`, {
        stdio: 'inherit',
        cwd: resolve(__dirname)
    });

    console.log('\nTests completed successfully');
    console.log('Report available at: test-results/markdown-test-results.md');

} catch (error) {
    console.error('\nTests completed with errors');
    console.log('Report available at: test-results/markdown-test-results.md');
    process.exit(1);
}
