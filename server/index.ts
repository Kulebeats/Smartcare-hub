import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import pharmacyRoutes from "./routes/pharmacy";
import ancRoutes from "./routes/anc.routes";
import prepRoutes from "./routes/prep.routes";
import * as net from 'net';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { patientAnalysisQueue, clinicalRulesQueue, alertProcessingQueue } from './cache/queue-processor';
import { FallbackBullAdapter } from './cache/fallback-queue';
import { cacheManager } from './cache/cache-manager';
import { getPerformanceMetrics, getPerformanceDashboard, applyAutomaticOptimizations, performanceOptimizer } from './cache/performance-optimizer';
import cron from 'node-cron';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup Bull Board for queue monitoring (only for Redis-based queues)
  try {
    // Check if we have Redis-based Bull queues
    if (patientAnalysisQueue && patientAnalysisQueue.constructor.name === 'Queue') {
      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath('/admin/queues');
      
      createBullBoard({
        queues: [
          new BullAdapter(patientAnalysisQueue),
          new BullAdapter(clinicalRulesQueue),
          new BullAdapter(alertProcessingQueue),
        ],
        serverAdapter: serverAdapter,
      });
      
      app.use('/admin/queues', serverAdapter.getRouter());
      console.log('Bull Board dashboard initialized with Redis queue monitoring');
    } else {
      console.log('Using fallback queues - Bull Board dashboard not available');
    }
  } catch (error) {
    console.log('Bull Board setup failed, continuing without queue dashboard');
  }

  // SmartCare PRO Performance routes are now in routes.ts to use fallback system
  
  // Cache management endpoints
  app.get('/api/admin/cache/stats', async (req: Request, res: Response) => {
    try {
      const stats = await cacheManager.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get cache stats' });
    }
  });

  app.delete('/api/admin/cache/clear', async (req: Request, res: Response) => {
    try {
      await cacheManager.clear();
      res.json({ success: true, message: 'Cache cleared successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to clear cache' });
    }
  });

  app.delete('/api/admin/cache/tag/:tag', async (req: Request, res: Response) => {
    try {
      const { tag } = req.params;
      await cacheManager.invalidateByTag(tag);
      res.json({ success: true, message: `Cache tag '${tag}' invalidated` });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to invalidate cache tag' });
    }
  });

  const server = await registerRoutes(app);
  
  // Register pharmacy routes
  app.use('/api/pharmacy', pharmacyRoutes);
  
  // Register ANC routes
  app.use('/api/anc', ancRoutes);
  
  // Register PrEP routes
  app.use('/api/prep', prepRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error("Server error:", err);
    res.status(status).json({ message });
    // Do not rethrow the error as it will crash the server
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || '5000', 10);
  
  // Start server on the specified port
  server.listen({
    port: PORT,
    host: '0.0.0.0'
  }, () => {
    log(`serving on port ${PORT}`);
    log('SmartCare PRO caching and queue systems initialized');
    log('Bull Board dashboard available at /admin/queues');  
    log('Performance dashboard available at /api/admin/performance/dashboard');
    
    // Schedule automatic performance optimizations every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      try {
        console.log('Running automatic performance optimization...');
        const result = await performanceOptimizer.implementAutomaticOptimizations();
        console.log('Automatic optimization completed:', result.optimizationsApplied.length, 'optimizations applied');
      } catch (error) {
        console.error('Automatic optimization failed:', error);
      }
    });

    // Schedule cache cleanup every hour
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('Running cache cleanup...');
        await cacheManager.invalidateByTag('temporary');
        console.log('Cache cleanup completed');
      } catch (error) {
        console.error('Cache cleanup failed:', error);
      }
    });

    // Schedule performance metrics collection every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await performanceOptimizer.collectMetrics();
      } catch (error) {
        console.error('Metrics collection failed:', error);
      }
    });
  }).on('error', (err: any) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
  
  // Handle process termination correctly
  const cleanup = () => {
    server.close(() => {
      log('Server gracefully terminated');
      process.exit(0);
    });
  };
  
  // Register cleanup handlers
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
})();
