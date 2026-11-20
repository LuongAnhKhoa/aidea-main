import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';

describe('API foundation', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  it('reports API and Supabase configuration status', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: 'ok',
      supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY),
    });
  });

  it('protects the current-user endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/v1/me`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      error: 'A valid Bearer access token is required.',
    });
  });

  it('protects project draft endpoints', async () => {
    const readResponse = await fetch(`${baseUrl}/api/v1/drafts/current`);
    assert.equal(readResponse.status, 401);

    const saveResponse = await fetch(`${baseUrl}/api/v1/drafts/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerInfo: {
          fullName: 'Test User',
          position: '',
          companyName: '',
          email: '',
          phone: '',
        },
        productInfo: {
          productName: '',
          category: '',
          sizeWeight: '',
          productionQuantity: '',
          packagingType: '',
        },
        currentStep: 2,
      }),
    });
    assert.equal(saveResponse.status, 401);
  });

  it('protects audio transcription when no local-test authorization is provided', async () => {
    const response = await fetch(`${baseUrl}/api/v1/transcriptions`, {
      method: 'POST',
    });
    assert.equal(response.status, 401);
    const result = await response.json();
    assert.match(result.error, /token is required/i);
  });

  it('allows local-test transcription requests only with the explicit dev opt-in', async () => {
    const previousValues = {
      allowLocalDev: process.env.TRANSCRIPTION_ALLOW_LOCAL_DEV,
      nodeEnv: process.env.NODE_ENV,
      apiKey: process.env.OPENAI_API_KEY,
    };
    process.env.TRANSCRIPTION_ALLOW_LOCAL_DEV = 'true';
    process.env.NODE_ENV = 'test';
    delete process.env.OPENAI_API_KEY;

    try {
      const body = new FormData();
      body.append('audio', new Blob(['test audio'], { type: 'audio/wav' }), 'test.wav');
      const response = await fetch(`${baseUrl}/api/v1/transcriptions`, {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'X-Local-Test-Mode': '1',
        },
        body,
      });
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: 'Backend chưa cấu hình OPENAI_API_KEY để nhận diện tệp âm thanh.',
      });

      process.env.NODE_ENV = 'production';
      const productionBody = new FormData();
      productionBody.append('audio', new Blob(['test audio'], { type: 'audio/wav' }), 'test.wav');
      const productionResponse = await fetch(`${baseUrl}/api/v1/transcriptions`, {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:5173',
          'X-Local-Test-Mode': '1',
        },
        body: productionBody,
      });
      assert.equal(productionResponse.status, 401);
    } finally {
      if (previousValues.allowLocalDev === undefined) {
        delete process.env.TRANSCRIPTION_ALLOW_LOCAL_DEV;
      } else {
        process.env.TRANSCRIPTION_ALLOW_LOCAL_DEV = previousValues.allowLocalDev;
      }
      if (previousValues.nodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousValues.nodeEnv;
      }
      if (previousValues.apiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousValues.apiKey;
      }
    }
  });
});
