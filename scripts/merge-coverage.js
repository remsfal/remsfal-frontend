#!/usr/bin/env node
/* eslint-env node */
/* global process */
/**
 * Script to merge coverage from both Vitest unit tests and Cypress E2E tests using NYC
 */
import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync } from 'fs';
import { join } from 'path';

const nycOutput = '.nyc_output';
const vitestNycOutput = '.nyc_output/vitest';
const coverageFinal = 'coverage';

console.log('🧪 Starting combined coverage collection...\n');

try {
  // Step 1: Clean up previous coverage data
  console.log('🧹 Cleaning previous coverage data...');
  [nycOutput, coverageFinal].forEach(dir => {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // Step 2: Run Vitest unit tests with coverage
  console.log('📊 Running Vitest unit tests with coverage...');
  execSync('vitest run --coverage', { stdio: 'inherit', shell: false });

  // Step 3: Copy Vitest coverage data to .nyc_output root
  const vitestCoverageFile = join(vitestNycOutput, 'coverage-final.json');
  if (existsSync(vitestCoverageFile)) {
    console.log('📋 Copying Vitest coverage data...');
    const destPath = join(nycOutput, 'vitest-coverage-final.json');
    cpSync(vitestCoverageFile, destPath);
    console.log('✓ Copied coverage-final.json from Vitest');
  } else {
    console.warn('⚠️  No Vitest coverage-final.json found');
  }

  // Step 4: Run Cypress E2E tests with coverage (if not already collected)
  console.log('🌐 Checking for Cypress E2E coverage...');
  
  // Check if cypress coverage files exist in .nyc_output
  const cypressCoverageExists = existsSync(join(nycOutput, 'out.json'));
  
  if (cypressCoverageExists) {
    console.log('✓ Found existing Cypress coverage data, skipping E2E test execution');
  } else if (process.env.SKIP_E2E !== 'true') {
    console.log('📝 No existing coverage found, running E2E tests...');
    try {
      // Build the project first
      console.log('🔨 Building project for E2E tests...');
      execSync('npm run build', { stdio: 'inherit', shell: false });

      // Start server and run E2E tests
      console.log('🚀 Running E2E tests with coverage collection...');
      execSync('npm run test:e2e', {
        stdio: 'inherit',
        shell: false,
      });
    } catch (error) {
      console.warn('⚠️  E2E tests failed or are not available, continuing with Vitest coverage only...');
      console.debug('E2E error:', error.message);
    }
  } else {
    console.warn('⚠️  SKIP_E2E is set, skipping E2E test execution. Cypress coverage should be collected separately.');
  }

  // Step 5: Generate merged coverage report using NYC
  if (existsSync(nycOutput)) {
    console.log('📈 Generating merged coverage reports...');
    execSync('nyc report --reporter=lcov --reporter=json --reporter=text --reporter=html', {
      stdio: 'inherit',
      shell: false
    });

    console.log('\n✅ Combined coverage collection completed!');
    console.log('📁 Final coverage reports available in: coverage/');
    console.log('📄 LCOV report: coverage/lcov.info');
    console.log('🌐 HTML report: coverage/index.html');
  } else {
    console.log('❌ No coverage data found');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error during coverage collection:', error.message);
  process.exit(1);
}
