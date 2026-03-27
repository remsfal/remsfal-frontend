#!/usr/bin/env node
/* global process */
/**
 * Script to merge coverage from both Vitest unit tests and Cypress E2E tests using NYC
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, readdirSync, rmSync } from 'node:fs';

const nycInput = '.nyc_input';
const nycOutput = '.nyc_output';
const coverageFinal = 'coverage';
const coverageVitest = 'coverage-vitest';
const coverageCypress = 'coverage-cypress';

console.log('📊 Merging coverage reports...\n');

try {
  // Check if coverage directories exist
  const hasVitest = existsSync(coverageVitest);
  const hasCypress = existsSync(coverageCypress);

  if (!hasVitest && !hasCypress) {
    console.log('❌ No coverage data found. Run coverage:unit and/or coverage:e2e first.');
    process.exit(1);
  }

  // Use a separate input directory so that raw Cypress bundle data (out.json placed by
  // @cypress/code-coverage into .nyc_output) does not pollute the merge.
  if (existsSync(nycInput)) {
    for (const file of readdirSync(nycInput)) {
      rmSync(`${nycInput}/${file}`);
    }
  } else {
    mkdirSync(nycInput, { recursive: true });
  }

  // Ensure output directory exists for the merged result
  if (!existsSync(nycOutput)) {
    mkdirSync(nycOutput, { recursive: true });
  }

  // Copy only the source-mapped coverage-final.json files into the clean input directory
  if (hasVitest && existsSync(`${coverageVitest}/coverage-final.json`)) {
    console.log('📋 Found Vitest coverage data');
    cpSync(`${coverageVitest}/coverage-final.json`, `${nycInput}/vitest.json`);
  }

  if (hasCypress && existsSync(`${coverageCypress}/coverage-final.json`)) {
    console.log('📋 Found Cypress coverage data');
    cpSync(`${coverageCypress}/coverage-final.json`, `${nycInput}/cypress.json`);
  }

  // Merge coverage reports using NYC — reads only from nycInput (no raw bundle data)
  console.log('🔀 Merging coverage reports with NYC...');
  const mergedFile = `${nycOutput}/merged.json`;
  execSync(`nyc merge ${nycInput} ${mergedFile}`, {
    stdio: 'inherit',
    shell: false
  });

  // Generate merged reports — use a temp dir that contains ONLY the merged file
  // to avoid double-counting the original vitest/cypress data.
  const nycReportDir = '.nyc_report';
  if (!existsSync(nycReportDir)) {
    mkdirSync(nycReportDir, { recursive: true });
  }
  cpSync(mergedFile, `${nycReportDir}/merged.json`);

  console.log('📈 Generating merged coverage reports...');
  execSync(`nyc report --temp-dir ${nycReportDir} --reporter=html --reporter=lcov --reporter=text \
                     --reporter=json --report-dir ${coverageFinal}`, {
    stdio: 'inherit',
    shell: false
  });

  console.log('\n✅ Coverage merge completed!');
  console.log('📁 Merged coverage reports available in: coverage/');
  console.log('📄 LCOV report: coverage/lcov.info');
  console.log('🌐 HTML report: coverage/index.html');

  if (hasVitest) {
    console.log('\n📊 Unit test coverage: coverage-vitest/index.html');
  }
  if (hasCypress) {
    console.log('📊 E2E test coverage: coverage-cypress/index.html');
  }

} catch (error) {
  console.error('❌ Error during coverage merge:', error.message);
  process.exit(1);
}
