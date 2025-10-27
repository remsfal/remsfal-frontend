import {
 beforeAll, afterAll, afterEach 
} from 'vitest';
import { server } from './server';  

// Start MSW server before all tests
beforeAll(() => server.listen());

// Reset any request handlers declared in tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
