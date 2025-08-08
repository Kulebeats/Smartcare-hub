import { EventEmitter } from 'events';

// Fallback queue implementation for when Redis is not available
export interface FallbackJob {
  id: string;
  data: any;
  opts: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  result?: any;
  error?: any;
}

export class FallbackQueue extends EventEmitter {
  private jobs: Map<string, FallbackJob> = new Map();
  private waitingJobs: FallbackJob[] = [];
  private activeJobs: FallbackJob[] = [];
  private completedJobs: FallbackJob[] = [];
  private failedJobs: FallbackJob[] = [];
  private processing = false;
  private processors: Array<(job: FallbackJob) => Promise<any>> = [];

  constructor(private name: string, private options: any = {}) {
    super();
    console.log(`Initialized fallback queue: ${name}`);
  }

  async add(data: any, opts: any = {}): Promise<FallbackJob> {
    const job: FallbackJob = {
      id: `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      opts,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: opts.attempts || this.options.defaultJobOptions?.attempts || 3,
      status: 'waiting'
    };

    this.jobs.set(job.id, job);
    this.waitingJobs.push(job);
    
    // Start processing if not already running
    if (!this.processing) {
      setImmediate(() => this.processJobs());
    }

    return job;
  }

  process(processor: (job: any) => Promise<any>): void {
    this.processors.push(processor);
  }

  private async processJobs(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.waitingJobs.length > 0 && this.processors.length > 0) {
      const job = this.waitingJobs.shift()!;
      job.status = 'active';
      this.activeJobs.push(job);

      try {
        // Execute the processor
        const result = await this.processors[0](job);
        
        // Job completed successfully
        job.status = 'completed';
        job.result = result;
        this.activeJobs = this.activeJobs.filter(j => j.id !== job.id);
        this.completedJobs.push(job);
        
        // Keep only recent completed jobs
        if (this.completedJobs.length > (this.options.defaultJobOptions?.removeOnComplete || 10)) {
          this.completedJobs.shift();
        }

      } catch (error) {
        job.attempts++;
        job.error = error;

        if (job.attempts >= job.maxAttempts) {
          // Job failed permanently
          job.status = 'failed';
          this.activeJobs = this.activeJobs.filter(j => j.id !== job.id);
          this.failedJobs.push(job);
          
          // Keep only recent failed jobs
          if (this.failedJobs.length > (this.options.defaultJobOptions?.removeOnFail || 5)) {
            this.failedJobs.shift();
          }
        } else {
          // Retry the job
          job.status = 'waiting';
          this.activeJobs = this.activeJobs.filter(j => j.id !== job.id);
          
          // Add delay before retry
          const delay = this.options.defaultJobOptions?.backoff?.delay || 2000;
          setTimeout(() => {
            this.waitingJobs.push(job);
            if (!this.processing) {
              setImmediate(() => this.processJobs());
            }
          }, delay);
        }
      }
    }

    this.processing = false;
  }

  async getWaiting(): Promise<FallbackJob[]> {
    return [...this.waitingJobs];
  }

  async getActive(): Promise<FallbackJob[]> {
    return [...this.activeJobs];
  }

  async getCompleted(): Promise<FallbackJob[]> {
    return [...this.completedJobs];
  }

  async getFailed(): Promise<FallbackJob[]> {
    return [...this.failedJobs];
  }

  async clean(grace: number, status: string): Promise<void> {
    const now = Date.now();
    
    if (status === 'completed') {
      this.completedJobs = this.completedJobs.filter(job => 
        now - job.timestamp < grace
      );
    } else if (status === 'failed') {
      this.failedJobs = this.failedJobs.filter(job => 
        now - job.timestamp < grace
      );
    }
  }
}

// Create fallback adapters for Bull Board
export class FallbackBullAdapter {
  constructor(private queue: FallbackQueue) {}

  get name() {
    return this.queue['name'];
  }

  getQueue() {
    return this.queue;
  }
}