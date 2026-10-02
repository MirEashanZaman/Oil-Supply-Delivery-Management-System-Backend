export interface BackendNode {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
  activeConnections: number;
  latencyMs: number;
}

export type BalancingStrategy = 'ROUND_ROBIN' | 'WEIGHTED_ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'IP_HASH';

export class EnterpriseLoadBalancer {
  private nodes: BackendNode[] = [];
  private currentIndex: number = 0;
  private strategy: BalancingStrategy;

  constructor(strategy: BalancingStrategy = 'ROUND_ROBIN', initialNodes: BackendNode[] = []) {
    this.strategy = strategy;
    this.nodes = [...initialNodes];
  }

  addNode(node: BackendNode): void {
    this.nodes.push(node);
  }

  removeNode(nodeId: string): void {
    this.nodes = this.nodes.filter((n) => n.id !== nodeId);
  }

  setNodeHealth(nodeId: string, healthy: boolean): void {
    const target = this.nodes.find((n) => n.id === nodeId);
    if (target) {
      target.healthy = healthy;
    }
  }

  setStrategy(strategy: BalancingStrategy): void {
    this.strategy = strategy;
  }

  getHealthyNodes(): BackendNode[] {
    return this.nodes.filter((n) => n.healthy);
  }

  selectNode(clientIp?: string): BackendNode {
    const healthyNodes = this.getHealthyNodes();
    if (healthyNodes.length === 0) {
      throw new Error('503 Service Unavailable: No healthy backend nodes available in pool');
    }

    switch (this.strategy) {
      case 'ROUND_ROBIN':
        return this.roundRobin(healthyNodes);
      case 'WEIGHTED_ROUND_ROBIN':
        return this.weightedRoundRobin(healthyNodes);
      case 'LEAST_CONNECTIONS':
        return this.leastConnections(healthyNodes);
      case 'IP_HASH':
        return this.ipHash(healthyNodes, clientIp || '127.0.0.1');
      default:
        return this.roundRobin(healthyNodes);
    }
  }

  private roundRobin(pool: BackendNode[]): BackendNode {
    const node = pool[this.currentIndex % pool.length];
    this.currentIndex = (this.currentIndex + 1) % pool.length;
    return node;
  }

  private weightedRoundRobin(pool: BackendNode[]): BackendNode {
    const totalWeight = pool.reduce((acc, curr) => acc + (curr.weight || 1), 0);
    if (totalWeight <= 0) return pool[0];

    let randomWeight = Math.floor(Math.random() * totalWeight);
    for (const node of pool) {
      randomWeight -= node.weight || 1;
      if (randomWeight < 0) {
        return node;
      }
    }
    return pool[0];
  }

  private leastConnections(pool: BackendNode[]): BackendNode {
    return pool.reduce((minNode, curr) =>
      curr.activeConnections < minNode.activeConnections ? curr : minNode,
    );
  }

  private ipHash(pool: BackendNode[], clientIp: string): BackendNode {
    let hash = 0;
    for (let i = 0; i < clientIp.length; i++) {
      hash = (hash << 5) - hash + clientIp.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % pool.length;
    return pool[index];
  }
}
