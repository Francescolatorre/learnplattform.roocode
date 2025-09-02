/**
 * Recursively collect .ts and .tsx files from a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(collectFiles(full));
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

/**
 * Migrate ErrorNotification* to Notification* in a file.
 * @param {string} file
 */
function migrateFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  let migrated = src;

  // Replace imports: import { ErrorNotificationX } from ... -> import { NotificationX } from ...
  migrated = migrated.replace(/(\{[^}]*?)ErrorNotification([A-Za-z0-9_]*)/g, '$1Notification$2');
  migrated = migrated.replace(/ErrorNotification([A-Za-z0-9_]*)/g, 'Notification$1');

  // Replace JSX usage: <ErrorNotification... -> <Notification...
  migrated = migrated.replace(/<ErrorNotification([A-Za-z0-9_]*)/g, '<Notification$1');
  migrated = migrated.replace(/<\/ErrorNotification([A-Za-z0-9_]*)/g, '</Notification$1');

  if (migrated !== src) {
    fs.copyFileSync(file, file + '.bak');
    fs.writeFileSync(file, migrated, 'utf8');
    console.log(`Migrated: ${file}`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node migrate-error-to-notification.js <fileOrDir1> [<fileOrDir2> ...]');
    process.exit(1);
  }
  args.forEach(target => {
    const abs = path.resolve(target);
    if (!fs.existsSync(abs)) {
      console.warn(`Not found: ${abs}`);
      return;
    }
    if (fs.statSync(abs).isDirectory()) {
      collectFiles(abs).forEach(migrateFile);
    } else if (abs.endsWith('.ts') || abs.endsWith('.tsx')) {
      migrateFile(abs);
    }
  });
}

module.exports = { migrateFile, collectFiles };
