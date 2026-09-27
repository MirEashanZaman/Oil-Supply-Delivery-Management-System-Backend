export interface KnowledgeDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface AgentContextMemory {
  userId: number;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class PetroleumRAGPipeline {
  private knowledgeBase: KnowledgeDocument[] = [
    {
      id: 'KB-01',
      category: 'Fuel Specification',
      title: 'Ultra-Low Sulfur Diesel (ULSD) Standards',
      content: 'ULSD must contain no more than 15 ppm sulfur. Flash point minimum is 52°C, cetane index minimum 40.',
      keywords: ['diesel', 'ulsd', 'sulfur', 'flash point', 'cetane'],
    },
    {
      id: 'KB-02',
      category: 'Safety & Transport',
      title: 'Hazmat Road Transport Regulations for Tankers',
      content: 'Tankers must maintain emergency shut-off valves, grounding during fuel offloading, and dual pressure relief caps.',
      keywords: ['transport', 'tanker', 'safety', 'hazmat', 'valves'],
    },
    {
      id: 'KB-03',
      category: 'Procurement',
      title: 'Wholesale Depot Batch Allocation & Benchmark Pricing',
      content: 'Bulk dealer allocations are calculated using Platts benchmark indices plus localized terminal handling surcharges.',
      keywords: ['pricing', 'platts', 'wholesale', 'dealer', 'allocation'],
    },
  ];

  async retrieveRelevantContext(query: string): Promise<KnowledgeDocument[]> {
    const qLower = query.toLowerCase();
    return this.knowledgeBase.filter(
      (doc) =>
        doc.title.toLowerCase().includes(qLower) ||
        doc.content.toLowerCase().includes(qLower) ||
        doc.keywords.some((k) => qLower.includes(k)),
    );
  }

  async runAgenticInference(query: string, memory?: AgentContextMemory): Promise<{ answer: string; retrievedDocs: string[] }> {
    const matched = await this.retrieveRelevantContext(query);
    const retrievedTitles = matched.map((m) => m.title);

    const contextSnippet = matched.length > 0
      ? `Retrieved context: ${matched.map((m) => m.content).join(' ')}`
      : 'No matching regulatory documents found.';

    return {
      answer: `[AI Petroleum Assistant] Query: "${query}". ${contextSnippet}`,
      retrievedDocs: retrievedTitles,
    };
  }
}
