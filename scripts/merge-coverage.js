#!/usr/bin/env node
/* eslint-env node */
/* global process */
/**
 * Script to merge coverage from both Vitest unit tests and Cypress E2E tests using NYC
 */
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

const nycOutput = '.nyc_output';
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

  // Step 2: Run Vitest unit tests with coverage using npm script
  console.log('📊 Running Vitest unit tests with coverage...');
  execSync('npm run coverage:unit', { stdio: 'inherit', shell: false });

  // Step 3: Run Cypress E2E tests with coverage (if available)
  console.log('🌐 Running Cypress E2E tests...');

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

  // Step 4: Generate merged coverage report using NYC
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
