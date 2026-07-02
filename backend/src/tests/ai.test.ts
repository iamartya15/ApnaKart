import { aiService } from '../services/ai/ai.service';
import { RAGVectorService } from '../services/ai/rag-vector.service';

describe('ApnaKart Phase 4 AI Engine Tests', () => {
  it('should generate embeddings with correct dimensionality', async () => {
    const text = 'Gaming laptop under 70000';
    const embeddings = await RAGVectorService.generateEmbeddings(text);

    expect(embeddings).toBeDefined();
    expect(embeddings.length).toBe(1536);
  });

  it('should parse natural language queries into structured filters', async () => {
    const query = 'gaming laptop under 70000';
    const result = await aiService.analyze(query, true);

    expect(result).toBeDefined();
    const parsed = JSON.parse(result);
    expect(parsed.searchTerm).toBe('gaming laptop');
    expect(parsed.maxPrice).toBe(70000);
  });

  it('should analyze review trust index metrics', async () => {
    const query = 'analyze reviews trust score';
    const result = await aiService.analyze(query, true);

    expect(result).toBeDefined();
    const parsed = JSON.parse(result);
    expect(parsed.trustScore).toBeDefined();
    expect(parsed.fakePercentage).toBeDefined();
    expect(parsed.sentiment).toBeDefined();
  });
});
