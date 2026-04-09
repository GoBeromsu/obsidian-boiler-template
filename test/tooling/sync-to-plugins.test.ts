import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import {
  applySyncPlan,
  buildSyncPlan,
  renderCiWorkflow,
  renderReleaseWorkflow,
} from '../../tooling/sync/index.mjs';

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tempDirs: string[] = [];

function writeFile(filePath: string, contents: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function writeManagedRepoContract(targetRoot: string): void {
  writeFile(
    path.join(targetRoot, 'package.json'),
    JSON.stringify(
      {
        name: path.basename(targetRoot),
        version: '1.0.0',
        scripts: {
          dev: 'node scripts/dev.mjs',
          build: 'pnpm run dev:build',
          lint: 'eslint .',
          test: 'vitest run',
          ci: 'pnpm run build && pnpm run lint && pnpm run test',
          prepare: 'husky',
          version: 'node scripts/version.mjs',
          postversion: 'git push && git push --tags',
          'release:patch': 'node scripts/release.mjs patch',
          'release:minor': 'node scripts/release.mjs minor',
          'release:major': 'node scripts/release.mjs major',
        },
        devDependencies: {
          husky: '^9.0.0',
          'lint-staged': '^15.0.0',
        },
      },
      null,
      2,
    ) + '\n',
  );
  writeFile(
    path.join(targetRoot, '.npmrc'),
    ['tag-version-prefix=""', 'message="chore(release): %s"', ''].join('\n'),
  );
}

function createTempTarget(name = 'sample-plugin'): string {
  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), `sync-target-${name}-`));
  tempDirs.push(targetRoot);
  return targetRoot;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('tooling sync', () => {
  it('renders CI workflow with optional test result publishing', () => {
    const withResults = renderCiWorkflow({
      dev: {
        buildCommand: ['pnpm', 'run', 'dev:build'],
        deploy: { mode: 'delegate', envVar: 'DESTINATION_VAULTS' },
      },
      ci: {
        pushBranches: ['main'],
        testResultsFile: 'test-results.xml',
      },
      release: {
        pluginName: 'sample-plugin',
        copyFiles: ['main.js'],
        publishFiles: ['${{ env.PLUGIN_NAME }}.zip'],
      },
    });

    const withoutResults = renderCiWorkflow({
      dev: {
        buildCommand: ['pnpm', 'run', 'dev:build'],
        deploy: { mode: 'delegate', envVar: 'DESTINATION_VAULTS' },
      },
      ci: {
        pushBranches: ['**'],
      },
      release: {
        pluginName: 'sample-plugin',
        copyFiles: ['main.js'],
        publishFiles: ['${{ env.PLUGIN_NAME }}.zip'],
      },
    });

    expect(withResults).toContain("branches: ['main']");
    expect(withResults).toContain('run: pnpm run ci');
    expect(withResults).toContain('Publish Test Results');
    expect(withoutResults).not.toContain('Publish Test Results');
  });

  it('renders release workflow from repo config', () => {
    const workflow = renderReleaseWorkflow({
      dev: {
        buildCommand: ['pnpm', 'run', 'dev:build'],
        deploy: { mode: 'delegate', envVar: 'DESTINATION_VAULTS' },
      },
      release: {
        pluginName: 'open-smart-connections',
        copyFiles: [
          'dist/main.js',
          'dist/manifest.json',
          { path: 'dist/styles.css', required: false },
        ],
        publishFiles: [
          '${{ env.PLUGIN_NAME }}.zip',
          'dist/main.js',
          'dist/manifest.json',
          { path: 'dist/styles.css', required: false },
        ],
      },
    });

    expect(workflow).toContain('PLUGIN_NAME: open-smart-connections');
    expect(workflow).toContain('run: pnpm run ci');
    expect(workflow).toContain('body_path: .github-release-body.md');
    expect(workflow).toContain('node scripts/release-notes.mjs --output .github-release-body.md');
    expect(workflow).toContain('copy_asset "dist/styles.css" "false"');
    expect(workflow).toContain('publish_asset "dist/styles.css" "false"');
    expect(workflow.indexOf('Install pnpm')).toBeLessThan(workflow.indexOf('actions/setup-node@v4'));
  });

  it('reports missing required config keys', async () => {
    const targetRoot = createTempTarget('missing-release');
    writeManagedRepoContract(targetRoot);
    writeFile(
      path.join(targetRoot, 'boiler.config.mjs'),
      [
        'export default {',
        "  dev: { buildCommand: ['pnpm', 'run', 'dev:build'], deploy: { mode: 'delegate', envVar: 'DESTINATION_VAULTS' } },",
        '};',
        '',
      ].join('\n'),
    );

    await expect(buildSyncPlan({ templateRoot, targetRoot })).rejects.toThrow(
      'missing required "release" config',
    );
  });

  it('supports dry-run without writing files', async () => {
    const targetRoot = createTempTarget('dry-run');
    writeManagedRepoContract(targetRoot);
    writeFile(
      path.join(targetRoot, 'boiler.config.mjs'),
      [
        'export default {',
        "  dev: {",
        "    buildCommand: ['pnpm', 'run', 'dev:build'],",
        "    deploy: {",
        "      mode: 'copy',",
        "      staticFiles: [{ from: 'manifest.json', to: 'manifest.json' }],",
        "      watchFiles: [{ from: 'main.js', to: 'main.js' }],",
        '    },',
        '  },',
        "  release: {",
        "    pluginName: 'dry-run-plugin',",
        "    copyFiles: ['main.js', 'manifest.json'],",
        "    publishFiles: ['${{ env.PLUGIN_NAME }}.zip', 'main.js', 'manifest.json'],",
        '  },',
        '};',
        '',
      ].join('\n'),
    );
    writeFile(path.join(targetRoot, 'scripts', 'dev.config.mjs'), 'legacy config\n');
    writeFile(path.join(targetRoot, 'scripts', 'dev.mjs'), 'outdated dev script\n');

    const plan = await buildSyncPlan({ templateRoot, targetRoot });
    const logs: string[] = [];
    await applySyncPlan(plan, {
      dryRun: true,
      onLog: (line: string) => logs.push(line),
    });

    expect(fs.readFileSync(path.join(targetRoot, 'scripts', 'dev.mjs'), 'utf8')).toBe(
      'outdated dev script\n',
    );
    expect(fs.existsSync(path.join(targetRoot, 'scripts', 'dev.config.mjs'))).toBe(true);
    expect(logs.some((line) => line.startsWith('DELETE scripts/dev.config.mjs'))).toBe(true);
  });

  it('writes synced files and removes legacy dev config', async () => {
    const targetRoot = createTempTarget('write-target');
    writeManagedRepoContract(targetRoot);
    writeFile(
      path.join(targetRoot, 'boiler.config.mjs'),
      [
        'export default {',
        "  dev: {",
        "    buildCommand: ['pnpm', 'run', 'dev:build'],",
        "    deploy: {",
        "      mode: 'copy',",
        "      staticFiles: [",
        "        { from: 'manifest.json', to: 'manifest.json' },",
        "        { from: 'styles.css', to: 'styles.css' },",
        '      ],',
        "      watchFiles: [{ from: 'main.js', to: 'main.js' }],",
        '    },',
        '  },',
        "  ci: {",
        "    pushBranches: ['**'],",
        "    testResultsFile: 'test-results.xml',",
        '  },',
        "  release: {",
        "    pluginName: 'write-target-plugin',",
        "    copyFiles: ['main.js', 'manifest.json', 'styles.css'],",
        "    publishFiles: [",
        "      '${{ env.PLUGIN_NAME }}.zip',",
        "      'main.js',",
        "      'manifest.json',",
        "      'styles.css',",
        '    ],',
        '  },',
        '};',
        '',
      ].join('\n'),
    );
    writeFile(path.join(targetRoot, 'scripts', 'dev.config.mjs'), 'legacy config\n');

    const plan = await buildSyncPlan({ templateRoot, targetRoot });
    const result = await applySyncPlan(plan);

    expect(result.changes).toBeGreaterThan(0);
    expect(fs.readFileSync(path.join(targetRoot, 'scripts', 'dev.mjs'), 'utf8')).toBe(
      fs.readFileSync(path.join(templateRoot, 'tooling', 'shared', 'dev.mjs'), 'utf8'),
    );
    expect(fs.readFileSync(path.join(targetRoot, 'scripts', 'version.mjs'), 'utf8')).toBe(
      fs.readFileSync(path.join(templateRoot, 'tooling', 'shared', 'version.mjs'), 'utf8'),
    );
    expect(fs.existsSync(path.join(targetRoot, 'scripts', 'dev.config.mjs'))).toBe(false);
    expect(fs.readFileSync(path.join(targetRoot, '.github', 'workflows', 'ci.yml'), 'utf8')).toContain(
      'Publish Test Results',
    );
    expect(fs.readFileSync(path.join(targetRoot, '.github', 'workflows', 'ci.yml'), 'utf8')).toContain(
      'run: pnpm run ci',
    );
    expect(
      fs.readFileSync(path.join(targetRoot, '.github', 'workflows', 'release.yml'), 'utf8'),
    ).toContain('body_path: .github-release-body.md');
    expect(
      fs.readFileSync(path.join(targetRoot, '.github', 'workflows', 'release.yml'), 'utf8'),
    ).toContain('write-target-plugin');
    expect(fs.readFileSync(path.join(targetRoot, 'scripts', 'release.mjs'), 'utf8')).toBe(
      fs.readFileSync(path.join(templateRoot, 'tooling', 'shared', 'release.mjs'), 'utf8'),
    );
    expect(fs.readFileSync(path.join(targetRoot, 'scripts', 'release-notes.mjs'), 'utf8')).toBe(
      fs.readFileSync(path.join(templateRoot, 'tooling', 'shared', 'release-notes.mjs'), 'utf8'),
    );
    expect(fs.existsSync(path.join(targetRoot, 'src', 'shared', 'plugin-notices.ts'))).toBe(false);
  });

  it('syncs shared implementation only when explicitly opted in', async () => {
    const targetRoot = createTempTarget('opt-in-impl');
    writeManagedRepoContract(targetRoot);
    writeFile(
      path.join(targetRoot, 'boiler.config.mjs'),
      [
        'export default {',
        "  dev: { buildCommand: ['pnpm', 'run', 'dev:build'], deploy: { mode: 'delegate', envVar: 'DESTINATION_VAULTS' } },",
        "  sync: { includeSharedImplementation: true },",
        "  release: {",
        "    pluginName: 'opt-in-impl-plugin',",
        "    copyFiles: ['main.js'],",
        "    publishFiles: ['${{ env.PLUGIN_NAME }}.zip'],",
        '  },',
        '};',
        '',
      ].join('\n'),
    );

    const plan = await buildSyncPlan({ templateRoot, targetRoot });
    await applySyncPlan(plan);

    expect(fs.readFileSync(path.join(targetRoot, 'src', 'shared', 'plugin-notices.ts'), 'utf8')).toBe(
      fs.readFileSync(path.join(templateRoot, 'tooling', 'shared', 'src-shared', 'plugin-notices.ts'), 'utf8'),
    );
    expect(fs.readFileSync(path.join(targetRoot, 'src', 'shared', 'plugin-logger.ts'), 'utf8')).toBe(
      fs.readFileSync(path.join(templateRoot, 'tooling', 'shared', 'src-shared', 'plugin-logger.ts'), 'utf8'),
    );
  });
});
