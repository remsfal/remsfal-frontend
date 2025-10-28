#!/usr/bin/env node
/* eslint-env node */
/* global process */
/**
 * Script to merge coverage from both Vitest unit tests and Cypress E2E tests
 */
import { execSync } from 'child_process';
import {existsSync, rmSync, mkdirSync, readFileSync, appendFileSync, cpSync} from 'fs';

const coverageVitest = 'coverage-vitest';
const coverageCypress = 'coverage-cypress';
const coverageFinal = 'coverage';
const nycTemp = '.nyc_output';

console.log('🧪 Starting combined coverage collection...\n');

try {
  // Clean up previous coverage data
  console.log('🧹 Cleaning previous coverage data...');
  [coverageVitest, coverageCypress, coverageFinal, nycTemp].forEach(dir => {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // Step 1: Run Vitest unit tests with coverage
  console.log('📊 Running Vitest unit tests with coverage...');
  execSync('vitest run --coverage', { stdio: 'inherit', shell: false });

  // Step 2: Run Cypress E2E tests with coverage (if Cypress is available)
  console.log('🌐 Checking for Cypress E2E tests...');
  
  let cypressCoverageAvailable = false;
  try {
    // Build the project first
    console.log('🔨 Building project for E2E tests...');
    execSync('npm run build', { stdio: 'inherit', shell: false });

    // Start server and run E2E tests
    console.log('🚀 Running E2E tests with coverage collection...');
    execSync('start-server-and-test preview http://localhost:4173 "cypress run --e2e"', { 
      stdio: 'inherit',
      shell: false,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    // Generate NYC coverage report for Cypress
    if (existsSync(nycTemp)) {
      console.log('📈 Generating Cypress coverage reports...');
      execSync('nyc report --reporter=lcov --reporter=json --reporter=text', { stdio: 'inherit', shell: false });
      cypressCoverageAvailable = true;
    }
  } catch (error) {
    console.warn('⚠️  E2E tests are not available or failed, continuing with Vitest coverage only...');
    console.debug('E2E error:', error.message);
  }

  // Step 3: Use Vitest coverage as base and merge if Cypress coverage exists
  if (existsSync(coverageVitest)) {
    console.log('📊 Using Vitest coverage as base...');
    if (!existsSync(coverageFinal)) {
      mkdirSync(coverageFinal, { recursive: true });
    }
    
    // Copy Vitest coverage to final directory
    cpSync(coverageVitest, coverageFinal, { recursive: true });
    
    if (cypressCoverageAvailable && existsSync(coverageCypress) && existsSync(`${coverageCypress}/lcov.info`)) {
      console.log('🔄 Merging Cypress E2E coverage...');
      // Append Cypress lcov to final lcov
      const cypressLcov = readFileSync(`${coverageCypress}/lcov.info`, 'utf8');
      appendFileSync(`${coverageFinal}/lcov.info`, '\n' + cypressLcov);
    }
    
  } else if (existsSync(coverageCypress)) {
    console.log('📊 Only Cypress coverage available, using as final coverage...');
    cpSync(coverageCypress, coverageFinal, { recursive: true });
    
  } else {
    console.log('❌ No coverage data found from either source');
    process.exit(1);
  }

  console.log('\n✅ Combined coverage collection completed!');
  console.log('📁 Final coverage reports available in: coverage/');
  console.log('📄 LCOV report: coverage/lcov.info');
  
} catch (error) {
  console.error('❌ Error during coverage collection:', error.message);
  process.exit(1);
}