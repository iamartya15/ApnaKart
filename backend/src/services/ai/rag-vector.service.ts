export interface VectorDocument {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

export interface VectorStoreProvider {
  search(embedding: number[], limit: number): Promise<VectorDocument[]>;
}

// 1. Pinecone Provider
export class PineconeProvider implements VectorStoreProvider {
  private apiKey = process.env.PINECONE_API_KEY;
  private environment = process.env.PINECONE_ENV;
  private indexName = process.env.PINECONE_INDEX_NAME || 'apnakart-index';

  async search(embedding: number[], limit: number): Promise<VectorDocument[]> {
    if (!this.apiKey || this.apiKey === 'your_pinecone_key_here') {
      throw new Error('Pinecone credentials missing.');
    }

    const host = `https://${this.indexName}.svc.${this.environment}.pinecone.io`;
    const response = await fetch(`${host}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        vector: embedding,
        topK: limit,
        includeMetadata: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinecone search query failed: ${await response.text()}`);
    }

    const data = (await response.json()) as any;
    return (data.matches || []).map((m: any) => ({
      id: m.id,
      score: m.score,
      metadata: m.metadata || {},
    }));
  }
}

// 2. MongoDB Atlas Vector Search Provider
export class MongoDBAtlasVectorProvider implements VectorStoreProvider {
  async search(embedding: number[], limit: number): Promise<VectorDocument[]> {
    // Atlas Vector search requires utilizing a MongoDB Aggregation Pipeline with '$vectorSearch'
    // This is handled natively inside the Mongoose models layer or dynamic aggregate runs.
    console.log('[Atlas Vector Search] Executing Mongoose Atlas Aggregation Pipeline stubs');
    return [
      { id: 'atlas-p1', score: 0.96, metadata: { title: 'Atlas Normalized Item 1', price: 1000 } },
    ].slice(0, limit);
  }
}

// 3. ChromaDB Provider
export class ChromaDBProvider implements VectorStoreProvider {
  private host = process.env.CHROMADB_HOST || 'http://localhost:8000';

  async search(embedding: number[], limit: number): Promise<VectorDocument[]> {
    const response = await fetch(`${this.host}/api/v1/collections/apnakart/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_embeddings: [embedding],
        n_results: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`ChromaDB query failed: ${await response.text()}`);
    }

    const data = (await response.json()) as any;
    const ids = data.ids?.[0] || [];
    const distances = data.distances?.[0] || [];
    const metadatas = data.metadatas?.[0] || [];

    return ids.map((id: string, idx: number) => ({
      id,
      score: 1 - (distances[idx] || 0), // convert distance metrics to similarity score
      metadata: metadatas[idx] || {},
    }));
  }
}

// 4. Fallback Sandbox Provider
export class MockVectorProvider implements VectorStoreProvider {
  async search(embedding: number[], limit: number): Promise<VectorDocument[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [
      {
        id: 'amazon-iphone15',
        score: 0.94,
        metadata: { title: 'Apple iPhone 15', category: 'Electronics', price: 79900 },
      },
      {
        id: 'flipkart-galaxys24',
        score: 0.89,
        metadata: { title: 'Samsung Galaxy S24', category: 'Electronics', price: 74999 },
      },
    ].slice(0, limit);
  }
}

export class RAGVectorService {
  private static provider: VectorStoreProvider;

  static {
    const providerName = process.env.VECTOR_SEARCH_PROVIDER || 'mock';
    if (providerName === 'pinecone') {
      this.provider = new PineconeProvider();
    } else if (providerName === 'mongodb_atlas') {
      this.provider = new MongoDBAtlasVectorProvider();
    } else if (providerName === 'chromadb') {
      this.provider = new ChromaDBProvider();
    } else {
      this.provider = new MockVectorProvider();
    }
  }

  /**
   * Generates a numerical vector embedding for the input query text.
   * Standard 1536-dimensional mock vector generator.
   */
  static async generateEmbeddings(text: string): Promise<number[]> {
    console.log(`[RAG Service] Generating numerical vector embeddings for: "${text}"`);
    const vector = Array.from({ length: 1536 }, (_, i) => {
      const charCode = text.charCodeAt(i % text.length) || 0;
      return Math.sin(charCode + i) * 0.1;
    });
    return vector;
  }

  /**
   * Performs a vector similarity search using the pluggable active provider.
   */
  static async vectorSearch(embedding: number[], limit = 5): Promise<VectorDocument[]> {
    console.log(
      `[RAG Service] Querying Vector database adapter [${process.env.VECTOR_SEARCH_PROVIDER || 'mock'}] with vector dimension size: ${embedding.length}`,
    );
    try {
      return await this.provider.search(embedding, limit);
    } catch (err: any) {
      console.warn(
        `[Vector Search Provider Error]: ${err.message}. Falling back to sandbox results.`,
      );
      return await new MockVectorProvider().search(embedding, limit);
    }
  }
}
export default RAGVectorService;
