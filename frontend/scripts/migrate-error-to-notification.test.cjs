
function tempFile(content) {
    const path = require('path');
    const os = require('os');
    const tmp = path.join(os.tmpdir(), `test_${Date.now()}_${Math.random()}.tsx`);
    fs.writeFileSync(tmp, content, 'utf8');
    return tmp;
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

function cleanup(file) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '.bak')) fs.unlinkSync(file + '.bak');
}

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (e) {
        console.error(`✗ ${name}\n  ${e.stack}`);
        process.exitCode = 1;
    }
}

// Test: import migration
test('migrates ErrorNotification import to Notification', () => {
    const src = `import { ErrorNotificationToast, ErrorNotificationProvider } from '@components/Notifications';`;
    const expected = `import { NotificationToast, NotificationProvider } from '@components/Notifications';`;
    const file = tempFile(src);
    migrateFile(file);
    const result = read(file);
    if (!result.includes(expected)) throw new Error('Import not migrated');
    cleanup(file);
});

// Test: JSX migration
test('migrates <ErrorNotificationToast /> to <NotificationToast />', () => {
    const src = `<ErrorNotificationToast message="hi" />`;
    const expected = `<NotificationToast message="hi" />`;
    const file = tempFile(src);
    migrateFile(file);
    const result = read(file);
    if (!result.includes(expected)) throw new Error('JSX not migrated');
    cleanup(file);
});

// Test: mixed usage
test('migrates mixed ErrorNotification usages', () => {
    const src = `
import { ErrorNotificationToast } from '@components/Notifications';
function Demo() {
  return <ErrorNotificationToast />;
}
`;
    const expected = `
import { NotificationToast } from '@components/Notifications';
function Demo() {
  return <NotificationToast />;
}
`;
    const file = tempFile(src);
    migrateFile(file);
    const result = read(file);
    if (!result.includes('NotificationToast')) throw new Error('Mixed usage not migrated');
    if (result.includes('ErrorNotification')) throw new Error('Old usage still present');
    cleanup(file);
});

// Test: no change if not present
test('does nothing if ErrorNotification not present', () => {
    const src = `import { NotificationToast } from '@components/Notifications';`;
    const file = tempFile(src);
    migrateFile(file);
    const result = read(file);
    if (result !== src) throw new Error('Changed when not needed');
    cleanup(file);
});
