import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SHARED_FILE_SPECS = [
  {
    source: ['tooling', 'shared', 'dev.mjs'],
    destination: ['scripts', 'dev.mjs'],
  },
  {
    source: ['tooling', 'shared', 'version.mjs'],
    destination: ['scripts', 'version.mjs'],
  },
  {
    source: ['tooling', 'shared', 'release.mjs'],
    destination: ['scripts', 'release.mjs'],
  },
  {
    source: ['tooling', 'shared', 'release-notes.mjs'],
    destination: ['scripts', 'release-notes.mjs'],
  },
  // Infra artifacts
  {
    source: ['tooling', 'shared', '.editorconfig'],
    destination: ['.editorconfig'],
  },
  {
    source: ['tooling', 'shared', 'eslint.base.js'],
    destination: ['eslint.base.js'],
  },
  {
    source: ['tooling', 'shared', 'commitlint.config.mjs'],
    destination: ['commitlint.config.mjs'],
  },
  {
    source: ['tooling', 'shared', '.husky', 'pre-commit'],
    destination: ['.husky', 'pre-commit'],
    chmod: true,
  },
  {
    source: ['tooling', 'shared', '.husky', 'commit-msg'],
    destination: ['.husky', 'commit-msg'],
    chmod: true,
  },
  // GitHub templates
  {
    source: ['tooling', 'shared', '.github', 'ISSUE_TEMPLATE', 'bug_report.yml'],
    destination: ['.github', 'ISSUE_TEMPLATE', 'bug_report.yml'],
  },
  {
    source: ['tooling', 'shared', '.github', 'ISSUE_TEMPLATE', 'feature_request.yml'],
    destination: ['.github', 'ISSUE_TEMPLATE', 'feature_request.yml'],
  },
  {
    source: ['tooling', 'shared', '.github', 'ISSUE_TEMPLATE', 'config.yml'],
    destination: ['.github', 'ISSUE_TEMPLATE', 'config.yml'],
  },
  {
    source: ['tooling', 'shared', '.github', 'PULL_REQUEST_TEMPLATE.md'],
    destination: ['.github', 'PULL_REQUEST_TEMPLATE.md'],
  },
  // Shared source modules
  {
    source: ['tooling', 'shared', 'src-shared', 'plugin-notices.ts'],
    destination: ['src', 'shared', 'plugin-notices.ts'],
  },
  {
    source: ['tooling', 'shared', 'src-shared', 'plugin-logger.ts'],
    destination: ['src', 'shared', 'plugin-logger.ts'],
  },
  {
    source: ['tooling', 'shared', 'src-shared', 'debounce-controller.ts'],
    destination: ['src', 'shared', 'debounce-controller.ts'],
  },
  {
    source: ['tooling', 'shared', 'src-shared', 'settings-migration.ts'],
    destination: ['src', 'shared', 'settings-migration.ts'],
  },
  {
    source: ['tooling', 'shared', 'src-shared', 'styles.base.css'],
    destination: ['src', 'shared', 'styles.base.css'],
  },
];

const GENERATED_FILE_SPECS = [
  {
    destination: ['.github', 'workflows', 'ci.yml'],
    render: renderCiWorkflow,
  },
  {
    destination: ['.github', 'workflows', 'release.yml'],
    render: renderReleaseWorkflow,
  },
];

const LEGACY_FILE_SPECS = [['scripts', 'dev.config.mjs']];
const TARGETS_FILE = ['tooling', 'sync', 'targets.json'];
const REQUIRED_SCRIPT_NAMES = [
  'dev',
  'build',
  'lint',
  'test',
  'ci',
  'prepare',
  'version',
  'postversion',
  'release:patch',
  'release:minor',
  'release:major',
];
const REQUIRED_SCRIPT_VALUES = {
  prepare: 'husky',
  version: 'node scripts/version.mjs',
  postversion: 'git push && git push --tags',
  'release:patch': 'node scripts/release.mjs patch',
  'release:minor': 'node scripts/release.mjs minor',
  'release:major': 'node scripts/release.mjs major',
};
const REQUIRED_NPMRC_VALUES = {
  'tag-version-prefix': ['""', ''],
  message: ['"chore(release): %s"', 'chore(release): %s'],
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isStringArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string' && item.length > 0)
  );
}

function escapeDoubleQuotedShell(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function normalizeReleaseAsset(item, targetName, key, index) {
  if (typeof item === 'string' && item.length > 0) {
    return { path: item, required: true };
  }

  assert(
    item &&
      typeof item === 'object' &&
      typeof item.path === 'string' &&
      item.path.length > 0 &&
      (item.required === undefined || typeof item.required === 'boolean'),
    `${targetName}: ${key}[${index}] must be a string or { path, required? } object`,
  );

  return {
    path: item.path,
    required: item.required ?? true,
  };
}

function normalizeReleaseAssetList(value, targetName, key) {
  assert(Array.isArray(value) && value.length > 0, `${targetName}: ${key} must be a non-empty array`);
  return value.map((item, index) => normalizeReleaseAsset(item, targetName, key, index));
}

function assertFileMappings(value, targetName, key) {
  assert(Array.isArray(value), `${targetName}: ${key} must be an array`);
  for (const [index, item] of value.entries()) {
    assert(
      item &&
        typeof item === 'object' &&
        typeof item.from === 'string' &&
        typeof item.to === 'string',
      `${targetName}: ${key}[${index}] must contain "from" and "to" string values`,
    );
  }
}

function formatInlineList(values) {
  return `[${values.map((value) => `'${value.replaceAll("'", "''")}'`).join(', ')}]`;
}

export function validateBoilerConfig(config, targetName = 'target') {
  assert(config && typeof config === 'object', `${targetName}: boiler.config.mjs must export an object`);

  assert(config.dev && typeof config.dev === 'object', `${targetName}: missing required "dev" config`);
  assert(
    isStringArray(config.dev.buildCommand),
    `${targetName}: dev.buildCommand must be a non-empty string array`,
  );
  assert(config.dev.deploy && typeof config.dev.deploy === 'object', `${targetName}: missing dev.deploy config`);
  assert(
    ['copy', 'delegate'].includes(config.dev.deploy.mode),
    `${targetName}: dev.deploy.mode must be "copy" or "delegate"`,
  );

  if (config.dev.deploy.mode === 'copy') {
    assertFileMappings(config.dev.deploy.staticFiles ?? [], targetName, 'dev.deploy.staticFiles');
    assertFileMappings(config.dev.deploy.watchFiles ?? [], targetName, 'dev.deploy.watchFiles');
  }

  if (config.dev.deploy.mode === 'delegate') {
    assert(
      typeof config.dev.deploy.envVar === 'string' && config.dev.deploy.envVar.length > 0,
      `${targetName}: dev.deploy.envVar must be set for delegate mode`,
    );
  }

  assert(
    config.release && typeof config.release === 'object',
    `${targetName}: missing required "release" config`,
  );
  assert(
    typeof config.release.pluginName === 'string' && config.release.pluginName.length > 0,
    `${targetName}: release.pluginName must be a non-empty string`,
  );
  const copyFiles = normalizeReleaseAssetList(config.release.copyFiles, targetName, 'release.copyFiles');
  const publishFiles = normalizeReleaseAssetList(
    config.release.publishFiles,
    targetName,
    'release.publishFiles',
  );

  if (config.version?.stageFiles !== undefined) {
    assert(
      Array.isArray(config.version.stageFiles) &&
        config.version.stageFiles.every((item) => typeof item === 'string' && item.length > 0),
      `${targetName}: version.stageFiles must be a string array`,
    );
  }

  if (config.ci?.pushBranches !== undefined) {
    assert(
      isStringArray(config.ci.pushBranches),
      `${targetName}: ci.pushBranches must be a non-empty string array when provided`,
    );
  }

  if (config.ci?.testResultsFile !== undefined) {
    assert(
      typeof config.ci.testResultsFile === 'string' && config.ci.testResultsFile.length > 0,
      `${targetName}: ci.testResultsFile must be a non-empty string when provided`,
    );
  }

  if (config.sync?.skipDestinations !== undefined) {
    assert(
      Array.isArray(config.sync.skipDestinations) &&
        config.sync.skipDestinations.every(
          (item) => Array.isArray(item) && item.every((segment) => typeof segment === 'string'),
        ),
      `${targetName}: sync.skipDestinations must be a string[][] when provided`,
    );
  }

  if (config.notices?.prefix !== undefined) {
    assert(
      typeof config.notices.prefix === 'string' && config.notices.prefix.length > 0,
      `${targetName}: notices.prefix must be a non-empty string when provided`,
    );
  }

  return {
    ...config,
    release: {
      ...config.release,
      copyFiles,
      publishFiles,
    },
  };
}

export function renderCiWorkflow(config) {
  const pushBranches = config.ci?.pushBranches ?? ['**'];
  const testResultsFile = config.ci?.testResultsFile;
  const lines = [
    '# Synced from obsidian-boiler-template/tooling/sync/index.mjs. Do not edit this file directly.',
    'name: CI',
    '',
    'on:',
    '  push:',
    `    branches: ${formatInlineList(pushBranches)}`,
    '  pull_request:',
    '    types: [opened, synchronize, reopened]',
    '',
    'env:',
    '  HUSKY: 0',
  ];

  if (testResultsFile) {
    lines.push('', 'permissions:', '  contents: read', '  checks: write', '  pull-requests: write');
  }

  lines.push(
    '',
    'jobs:',
    '  build:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '        with:',
    '          fetch-depth: 1',
    '      - name: Install pnpm',
    '        uses: pnpm/action-setup@v4',
    '      - uses: actions/setup-node@v4',
    '        with:',
    "          node-version: '20'",
    "          cache: 'pnpm'",
    '      - name: Install dependencies',
    '        run: pnpm install --frozen-lockfile',
    '      - name: Run CI',
    '        run: pnpm run ci',
  );

  if (testResultsFile) {
    lines.push(
      '      - name: Publish Test Results',
      '        uses: EnricoMi/publish-unit-test-result-action@v2',
      '        if: always()',
      '        with:',
      `          files: '${testResultsFile}'`,
    );
  }

  return `${lines.join('\n')}\n`;
}

export function renderReleaseWorkflow(config) {
  const normalizedConfig = validateBoilerConfig(config, 'release-workflow');
  const copyFileLines = normalizedConfig.release.copyFiles.map(
    (asset) => `          copy_asset "${escapeDoubleQuotedShell(asset.path)}" "${asset.required ? 'true' : 'false'}"`,
  );
  const publishFileLines = normalizedConfig.release.publishFiles.map(
    (asset) =>
      `          publish_asset "${escapeDoubleQuotedShell(asset.path)}" "${asset.required ? 'true' : 'false'}"`,
  );

  return [
    '# Synced from obsidian-boiler-template/tooling/sync/index.mjs. Do not edit this file directly.',
    'name: Release plugin',
    '',
    'on:',
    '  push:',
    '    tags:',
    "      - '*'",
    '',
    'permissions:',
    '  contents: write',
    '',
    'env:',
    `  PLUGIN_NAME: ${config.release.pluginName}`,
    '',
    'jobs:',
    '  build:',
    '    runs-on: ubuntu-latest',
    '',
    '    env:',
    '      HUSKY: 0',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '      - name: Install pnpm',
    '        uses: pnpm/action-setup@v4',
    '      - uses: actions/setup-node@v4',
    '        with:',
    "          node-version: '20'",
    "          cache: 'pnpm'",
    '      - name: Install dependencies',
    '        run: pnpm install --frozen-lockfile',
    '      - name: Validate release metadata',
    '        shell: bash',
        '        run: |',
    '          set -euo pipefail',
    '          TAG="${GITHUB_REF_NAME}"',
    '          PACKAGE_VERSION="$(node --input-type=module -e "import fs from \x27node:fs\x27; console.log(JSON.parse(fs.readFileSync(\x27package.json\x27, \x27utf8\x27)).version)")"',
    '          MANIFEST_VERSION="$(node --input-type=module -e "import fs from \x27node:fs\x27; console.log(JSON.parse(fs.readFileSync(\x27manifest.json\x27, \x27utf8\x27)).version)")"',
    '          if [[ "$TAG" != "$PACKAGE_VERSION" ]]; then',
    '            echo "Tag ${TAG} does not match package.json version ${PACKAGE_VERSION}" >&2',
    '            exit 1',
    '          fi',
    '          if [[ "$PACKAGE_VERSION" != "$MANIFEST_VERSION" ]]; then',
    '            echo "package.json version ${PACKAGE_VERSION} does not match manifest.json version ${MANIFEST_VERSION}" >&2',
    '            exit 1',
    '          fi',
    '      - name: Run CI',
    '        run: pnpm run ci',
    '      - name: Generate Release Notes',
    '        run: node scripts/release-notes.mjs --output .github-release-body.md',
    '      - name: Prepare Release Assets',
    '        id: release_assets',
    '        shell: bash',
    '        run: |',
    '          set -euo pipefail',
    '          copy_asset() {',
    '            local source="$1"',
    '            local required="$2"',
    '            if [[ -f "$source" ]]; then',
    '              cp "$source" "${{ env.PLUGIN_NAME }}/"',
    '            elif [[ "$required" == "true" ]]; then',
    '              echo "Required release asset missing: $source" >&2',
    '              exit 1',
    '            fi',
    '          }',
    '          publish_asset() {',
    '            local source="$1"',
    '            local required="$2"',
    '            if [[ -f "$source" ]]; then',
    '              printf "%s\\n" "$source" >> .release-files.txt',
    '            elif [[ "$required" == "true" ]]; then',
    '              echo "Required publish asset missing: $source" >&2',
    '              exit 1',
    '            fi',
    '          }',
    '          mkdir "${{ env.PLUGIN_NAME }}"',
    '          : > .release-files.txt',
    ...copyFileLines,
    '          zip -r "${{ env.PLUGIN_NAME }}.zip" "${{ env.PLUGIN_NAME }}"',
    ...publishFileLines,
    '          {',
    '            echo "files<<EOF"',
    '            cat .release-files.txt',
    '            echo "EOF"',
    '          } >> "$GITHUB_OUTPUT"',
    '      - name: Release',
    '        uses: softprops/action-gh-release@v2',
    '        with:',
    '          body_path: .github-release-body.md',
    '          files: ${{ steps.release_assets.outputs.files }}',
    '',
  ].join('\n');
}

function parseSimpleNpmrc(text) {
  const settings = new Map();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    settings.set(key, value);
  }

  return settings;
}

function validateManagedRepoContract(targetRoot) {
  const targetName = path.basename(targetRoot);
  const packageJsonPath = path.join(targetRoot, 'package.json');
  assert(fs.existsSync(packageJsonPath), `${targetName}: missing package.json`);

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts ?? {};
  assert(scripts && typeof scripts === 'object', `${targetName}: package.json must define scripts`);

  for (const scriptName of REQUIRED_SCRIPT_NAMES) {
    assert(typeof scripts[scriptName] === 'string' && scripts[scriptName].length > 0, `${targetName}: missing required script "${scriptName}"`);
  }

  for (const [scriptName, expectedValue] of Object.entries(REQUIRED_SCRIPT_VALUES)) {
    assert(
      scripts[scriptName] === expectedValue,
      `${targetName}: script "${scriptName}" must be "${expectedValue}"`,
    );
  }

  const devDeps = packageJson.devDependencies ?? {};
  assert(typeof devDeps.husky === 'string', `${targetName}: devDependencies must include "husky"`);
  assert(typeof devDeps['lint-staged'] === 'string', `${targetName}: devDependencies must include "lint-staged"`);

  const npmrcPath = path.join(targetRoot, '.npmrc');
  assert(fs.existsSync(npmrcPath), `${targetName}: missing .npmrc`);
  const npmrc = parseSimpleNpmrc(fs.readFileSync(npmrcPath, 'utf8'));
  for (const [key, allowedValues] of Object.entries(REQUIRED_NPMRC_VALUES)) {
    assert(
      allowedValues.includes(npmrc.get(key) ?? ''),
      `${targetName}: .npmrc must set ${key} to one of ${allowedValues.join(', ')}`,
    );
  }
}

export async function loadBoilerConfig(targetRoot) {
  const configPath = path.join(targetRoot, 'boiler.config.mjs');
  assert(fs.existsSync(configPath), `${targetRoot}: missing boiler.config.mjs`);

  const configUrl = pathToFileURL(configPath);
  configUrl.searchParams.set('t', String(fs.statSync(configPath).mtimeMs));

  const imported = await import(configUrl.href);
  return validateBoilerConfig(imported.default ?? imported, path.basename(targetRoot));
}

function createWriteOperation(filePath, content, { chmod = false } = {}) {
  const exists = fs.existsSync(filePath);
  if (exists && fs.readFileSync(filePath, 'utf8') === content) {
    return null;
  }

  return {
    kind: 'write',
    action: exists ? 'UPDATE' : 'CREATE',
    filePath,
    content,
    chmod,
  };
}

function createDeleteOperation(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return {
    kind: 'delete',
    action: 'DELETE',
    filePath,
  };
}

function pathSegmentsEqual(left, right) {
  return left.length === right.length && left.every((segment, index) => segment === right[index]);
}

export async function buildSyncPlan({ templateRoot, targetRoot }) {
  validateManagedRepoContract(targetRoot);
  const config = await loadBoilerConfig(targetRoot);
  const operations = [];

  const skipDestinations = config.sync?.skipDestinations ?? [];

  for (const spec of SHARED_FILE_SPECS) {
    if (skipDestinations.some((skip) => pathSegmentsEqual(skip, spec.destination))) {
      continue;
    }

    const sourcePath = path.join(templateRoot, ...spec.source);
    const targetPath = path.join(targetRoot, ...spec.destination);
    const content = fs.readFileSync(sourcePath, 'utf8');
    const operation = createWriteOperation(targetPath, content, { chmod: spec.chmod ?? false });
    if (operation) {
      operations.push(operation);
    }
  }

  for (const spec of GENERATED_FILE_SPECS) {
    const targetPath = path.join(targetRoot, ...spec.destination);
    const content = spec.render(config);
    const operation = createWriteOperation(targetPath, content);
    if (operation) {
      operations.push(operation);
    }
  }

  for (const legacyFile of LEGACY_FILE_SPECS) {
    const operation = createDeleteOperation(path.join(targetRoot, ...legacyFile));
    if (operation) {
      operations.push(operation);
    }
  }

  return {
    targetName: path.basename(targetRoot),
    targetRoot,
    operations,
  };
}

export async function applySyncPlan(plan, { dryRun = false, onLog = () => {} } = {}) {
  if (plan.operations.length === 0) {
    onLog(`UNCHANGED ${plan.targetName}`);
    return { ...plan, changes: 0 };
  }

  for (const operation of plan.operations) {
    onLog(`${operation.action} ${path.relative(plan.targetRoot, operation.filePath)}`);
    if (dryRun) {
      continue;
    }

    if (operation.kind === 'write') {
      fs.mkdirSync(path.dirname(operation.filePath), { recursive: true });
      fs.writeFileSync(operation.filePath, operation.content);
      if (operation.chmod) {
        fs.chmodSync(operation.filePath, 0o755);
      }
      continue;
    }

    fs.rmSync(operation.filePath, { force: true });
  }

  return { ...plan, changes: plan.operations.length };
}

export function resolveTargetRoot(templateRoot, targetName) {
  const templateName = path.basename(templateRoot);
  if (targetName === '.' || targetName === templateName) {
    return templateRoot;
  }

  return path.join(path.dirname(templateRoot), targetName);
}

export function loadManagedTargetNames(templateRoot) {
  const targetsPath = path.join(templateRoot, ...TARGETS_FILE);
  assert(fs.existsSync(targetsPath), `Missing managed targets file: ${targetsPath}`);
  const raw = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  const targets = Array.isArray(raw) ? raw : raw.targets;
  assert(isStringArray(targets), `${targetsPath}: targets must be a non-empty string array`);
  return [...new Set(targets)].sort((left, right) => left.localeCompare(right));
}

export function parseArgs(argv) {
  const options = {
    dryRun: false,
    check: false,
    targets: null,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--check') {
      options.check = true;
      options.dryRun = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--targets' || arg.startsWith('--targets=')) {
      const value = arg === '--targets' ? argv[++index] : arg.slice('--targets='.length);
      assert(value, '--targets requires a comma-separated value');
      options.targets = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export async function runCli(
  argv,
  {
    templateRoot,
    stdout = process.stdout,
  } = {},
) {
  const options = parseArgs(argv);
  if (options.help) {
    stdout.write(
      [
        'Usage: node scripts/sync-to-plugins.mjs [--targets repo-a,repo-b] [--dry-run] [--check]',
        '',
        'Options:',
        '  --targets   Comma-separated target repo names. Defaults to tooling/sync/targets.json.',
        '  --dry-run   Show planned changes without writing files.',
        '  --check     Fail if managed repos drift from the template contract.',
        '  --help      Show this help text.',
        '',
      ].join('\n'),
    );
    return { targetCount: 0, changeCount: 0, dryRun: options.dryRun };
  }

  const targetNames = options.targets ?? loadManagedTargetNames(templateRoot);
  assert(targetNames.length > 0, `No boiler-configured targets found near ${templateRoot}`);

  let changeCount = 0;
  for (const targetName of targetNames) {
    const targetRoot = resolveTargetRoot(templateRoot, targetName);
    assert(fs.existsSync(targetRoot), `Target repo not found: ${targetName}`);

    stdout.write(`\n== ${targetName} ==\n`);
    const plan = await buildSyncPlan({ templateRoot, targetRoot });
    const result = await applySyncPlan(plan, {
      dryRun: options.dryRun,
      onLog: (line) => stdout.write(`${line}\n`),
    });
    changeCount += result.changes;
  }

  stdout.write(
    `\n${options.dryRun ? 'Dry run complete' : 'Sync complete'}: ${targetNames.length} target(s), ${changeCount} change(s)\n`,
  );

  if (options.check && changeCount > 0) {
    throw new Error(`Managed repo drift detected: ${changeCount} pending change(s)`);
  }

  return {
    targetCount: targetNames.length,
    changeCount,
    dryRun: options.dryRun,
  };
}
