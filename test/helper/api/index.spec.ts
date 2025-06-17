import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import { typedRequest } from '../../../src/helper/api';

vi.mock('axios');

type Path = '/users/{userId}';
type Method = 'get';

describe('typedRequest', () => {

  const mockedAxios = axios as unknown as {
    request: vi.Mock;
  };

  beforeEach(() => {
    mockedAxios.request = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should replace path params and pass query, return typed data', async () => {
    const method: Method = 'get';
    const path: Path = '/users/{userId}';
    const params = {
      userId: 'abc123',
      search: 'max',
    };

    const mockResponse: AxiosResponse = {
      data: { id: 'abc123', name: 'Max Mustermann' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    };

    mockedAxios.request.mockResolvedValueOnce(mockResponse);

    const result = await typedRequest(method, path, {
      params,
    });

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: '/users/abc123',
        params: { search: 'max' },
        data: undefined,
      })
    );

    expect(result).toEqual({ id: 'abc123', name: 'Max Mustermann' });
  });

  it('should handle missing query params correctly', async () => {
    const method: Method = 'get';
    const path: Path = '/users/{userId}';
    const params = { userId: '42' };

    const mockResponse: AxiosResponse = {
      data: { id: '42', name: 'Jane Doe' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    };

    mockedAxios.request.mockResolvedValueOnce(mockResponse);

    const result = await typedRequest(method, path, {
      params,
    });

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: '/users/42',
        params: {},
        data: undefined,
      })
    );

    expect(result).toEqual({ id: '42', name: 'Jane Doe' });
  });
});
