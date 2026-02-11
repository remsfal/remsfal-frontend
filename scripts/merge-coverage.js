#!/usr/bin/env node
/* global process */
/**
 * Script to merge coverage from both Vitest unit tests and Cypress E2E tests using NYC
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync } from 'fs';

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

  // Create .nyc_output directory if it doesn't exist
  if (!existsSync(nycOutput)) {
    mkdirSync(nycOutput, { recursive: true });
  }

  // Copy coverage data to .nyc_output for merging
  if (hasVitest && existsSync(`${coverageVitest}/coverage-final.json`)) {
    console.log('📋 Found Vitest coverage data');
    cpSync(`${coverageVitest}/coverage-final.json`, `${nycOutput}/vitest.json`);
  }

  if (hasCypress && existsSync(`${coverageCypress}/coverage-final.json`)) {
    console.log('📋 Found Cypress coverage data');
    cpSync(`${coverageCypress}/coverage-final.json`, `${nycOutput}/cypress.json`);
  }

  // Merge coverage reports using NYC
  console.log('🔀 Merging coverage reports with NYC...');
  execSync(`nyc merge ${nycOutput} ${nycOutput}/coverage.json`, {
    stdio: 'inherit',
    shell: false
  });

  // Generate merged reports
  console.log('📈 Generating merged coverage reports...');
  execSync(`nyc report --temp-dir ${nycOutput} --reporter=html --reporter=lcov --reporter=text \
                     --reporter=json --report-dir ${coverageFinal} --all`, {
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
