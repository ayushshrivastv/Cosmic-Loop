# Setting Up Your Local Environment

To connect to the real Perplexity API and stop seeing mock responses, follow these steps:

## 1. Create Your .env.local File

```bash
# In your terminal, run:
cp .env.example .env.local
```

## 2. Edit Your .env.local File

Open the .env.local file in your text editor and update the following values:

```
# Perplexity API (REQUIRED)
PERPLEXITY_API_KEY=your_actual_perplexity_api_key_here
PERPLEXITY_BASE_URL=https://api.perplexity.ai
PERPLEXITY_MODEL=llama-3.1-sonar-large-32k-online
```

Replace `your_actual_perplexity_api_key_here` with your real Perplexity API key.

## 3. Restart Your Development Server

After saving your .env.local file, restart your development server:

```bash
# Stop the current server with Ctrl+C
# Then restart it
npm run dev
```

## 4. Verify Real API Connection

Once your server restarts, try making a query again. You should no longer see the "development mock response" message, and instead get real AI-powered responses from the Perplexity API.

## Troubleshooting

If you're still seeing mock responses:

1. Make sure your .env.local file is in the root directory of your project
2. Check that you've entered the correct API key
3. Verify that your development server has fully restarted
4. Check the console logs for any API connection errors
