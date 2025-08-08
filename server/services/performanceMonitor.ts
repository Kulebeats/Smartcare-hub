/**
 * Performance Monitoring Service (Replit Optimized)
 * Tracks system performance metrics and resource usage
 */

import { getCacheStats } from './cacheManager';

interface PerformanceMetrics {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  database: {
    activeConnections: number;
    totalQueries: number;
    avgResponseTime: number;
    failedQueries: number;
  };
  cache: {
    hitRate: number;
    totalKeys: number;
    memoryUsage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
  uptime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsHistory = 100;
  private queryCount = 0;
  private queryTimes: number[] = [];
  private requestCount = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private requestTimes: number[] = [];

  constructor() {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);
  }

  private collectMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cacheStats = getCacheStats();
    
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      memory: {
        used: memoryUsage.rss,
        total: this.getSystemMemory(),
        percentage: (memoryUsage.rss / this.getSystemMemory()) * 100,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      database: {
        activeConnections: this.getActiveConnections(),
        totalQueries: this.queryCount,
        avgResponseTime: this.calculateAvgQueryTime(),
        failedQueries: 0 // Would need to track this separately
      },
      cache: {
        hitRate: this.calculateCacheHitRate(cacheStats),
        totalKeys: cacheStats.static.keys + cacheStats.dynamic.keys + cacheStats.clinical.keys,
        memoryUsage: this.estimateCacheMemoryUsage(cacheStats)
      },
      requests: {
        total: this.requestCount,
        successful: this.successfulRequests,
        failed: this.failedRequests,
        avgResponseTime: this.calculateAvgRequestTime()
      },
      uptime: process.uptime()
    };

    this.metrics.push(metric);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  private getSystemMemory(): number {
    // Estimate system memory (Replit typically provides limited memory)
    return parseInt(process.env.REPLIT_MEMORY_LIMIT || '1073741824'); // 1GB default
  }

  private getActiveConnections(): number {
    // Would need database pool reference to get actual count
    return 0; // Placeholder
  }

  private calculateAvgQueryTime(): number {
    if (this.queryTimes.length === 0) return 0;
    const sum = this.queryTimes.reduce((a, b) => a + b, 0);
    return sum / this.queryTimes.length;
  }

  private calculateAvgRequestTime(): number {
    if (this.requestTimes.length === 0) return 0;
    const sum = this.requestTimes.reduce((a, b) => a + b, 0);
    return sum / this.requestTimes.length;
  }

  private calculateCacheHitRate(cacheStats: any): number {
    const totalHits = cacheStats.static.hits + cacheStats.dynamic.hits + cacheStats.clinical.hits;
    const totalMisses = cacheStats.static.misses + cacheStats.dynamic.misses + cacheStats.clinical.misses;
    const total = totalHits + totalMisses;
    return total > 0 ? (totalHits / total) * 100 : 0;
  }

  private estimateCacheMemoryUsage(cacheStats: any): number {
    // Rough estimate: 1KB per key
    const totalKeys = cacheStats.static.keys + cacheStats.dynamic.keys + cacheStats.clinical.keys;
    return totalKeys * 1024;
  }

  // Public methods for tracking
  recordQuery(duration: number): void {
    this.queryCount++;
    this.queryTimes.push(duration);
    
    // Keep only last 100 query times
    if (this.queryTimes.length > 100) {
      this.queryTimes = this.queryTimes.slice(-100);
    }
  }

  recordRequest(duration: number, success: boolean): void {
    this.requestCount++;
    this.requestTimes.push(duration);
    
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
    
    // Keep only last 100 request times
    if (this.requestTimes.length > 100) {
      this.requestTimes = this.requestTimes.slice(-100);
    }
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getMetricsHistory(minutes: number = 30): PerformanceMetrics[] {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp >= cutoffTime);
  }

  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const latest = this.getLatestMetrics();
    if (!latest) {
      return {
        status: 'warning',
        issues: ['No metrics available'],
        recommendations: ['Wait for metrics collection to begin']
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Memory checks
    if (latest.memory.percentage > 85) {
      issues.push('High memory usage');
      recommendations.push('Consider optimizing memory-intensive operations');
      status = 'critical';
    } else if (latest.memory.percentage > 70) {
      issues.push('Elevated memory usage');
      recommendations.push('Monitor memory usage closely');
      status = 'warning';
    }

    // Cache checks
    if (latest.cache.hitRate < 60) {
      issues.push('Low cache hit rate');
      recommendations.push('Review caching strategy and TTL settings');
      if (status === 'healthy') status = 'warning';
    }

    // Request performance checks
    if (latest.requests.avgResponseTime > 2000) {
      issues.push('Slow average response time');
      recommendations.push('Optimize database queries and caching');
      if (status === 'healthy') status = 'warning';
    }

    return { status, issues, recommendations };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Middleware for tracking request performance
export function performanceMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    performanceMonitor.recordRequest(duration, success);
  });
  
  next();
}