import { ScheduledTask } from 'node-cron';
import cron = require('node-cron');
import Cron from './cron';
import { assert } from './utils';

function noop(): void {
  return null;
}

export type tickCallback = (val: any, indx?: number) => any;

export interface JobOptions {
  /**
   * When job should be stopped
   */
  endTime?: number;

  /**
   * Start job
   */
  firstTick?: tickCallback;

  /**
   * Cron-string
   */
  frequency: string;

  /**
   * Job identifier
   */
  id: string;

  /**
   * Finish job
   */
  lastTick?: tickCallback;

  /**
   * Job-handler for ticks before `firstTick` and `lastTick`
   */
  tick?: tickCallback;

  /**
   * Number of `tick`s
   */
  ticksCount: number;

  /**
   * Time in seconds
   */
  ticksDelay: number;
}

/**
 * Execution:
 *
 * ```text
 * firstTick() -> ...tick() -> lastTick()
 * ```
 *
 * `tick` is called `ticksCount` times
 */
export default class Job {
  private firstTick: tickCallback;
  private internalId: string;
  private internalJob: ScheduledTask;
  private lastTick: tickCallback;
  private tick: tickCallback;
  private constructor() {
    // do nothing
  }

  get id(): string {
    return this.internalId;
  }

  public static createJob(options: JobOptions): Job {
    assert(
      '"options.ticksCount" must be greater than 0',
      options.ticksCount > 0
    );
    const job = new Job();
    const cronInstance = Cron.getCron();
    job.firstTick = options.firstTick || noop;
    job.tick = options.tick || noop;
    job.lastTick = options.lastTick || noop;
    job.internalId = options.id;
    job.internalJob = cron.schedule(options.frequency, () => {
      const currentTime = new Date().getTime();
      const endTime = options.endTime
        ? options.endTime
        : Number.POSITIVE_INFINITY;
      if (currentTime > endTime) {
        return;
      }
      let result = null;
      if (cronInstance.has(job.id)) {
        result = job.firstTick.call(null);
      }
      for (let i = 0; i < options.ticksCount; i++) {
        setTimeout(() => {
          if (cronInstance.has(job.id)) {
            result = job.tick.call(null, result, i + 1);
          }
        }, 1000 * options.ticksDelay * (i + 1));
      }
      setTimeout(() => {
        if (cronInstance.has(job.id)) {
          job.lastTick.call(null, result);
        }
      }, (options.ticksCount + 1) * options.ticksDelay * 1000);
    });
    cronInstance.add(job.internalId, job.internalJob);
    return job;
  }

  public destroy(): void {
    Cron.getCron().destroy(this.id);
  }

  public start(): void {
    Cron.getCron().start(this.id);
  }

  public stop(): void {
    Cron.getCron().stop(this.id);
  }
}
