import {ScheduledTask} from 'node-cron';
import cron = require('node-cron');
import Cron from './cron';
import {assert} from './utils';

function noop(): void {
  return null;
}

// tslint:disable-next-line:no-any
export type tickCallback = (val: any, indx?: number) => any;

export interface JobOptions {
  /**
   * Job identifier
   */
  id: string;

  /**
   * Cron-string
   */
  frequency: string;

  /**
   * Number of `tick`s
   */
  ticksCount: number;

  /**
   * Time in seconds
   */
  ticksDelay: number;

  /**
   * When job should be stopped
   */
  endTime?: number;

  /**
   * Start job
   */
  firstTick?: tickCallback;

  /**
   * Job-handler for ticks before `firstTick` and `lastTick`
   */
  tick?: tickCallback;

  /**
   * Finish job
   */
  lastTick?: tickCallback;
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
  public static createJob(options: JobOptions): Job {
    assert('"options.ticksCount" must be greater than 0', options.ticksCount > 0);
    const job = new Job();
    const cronInstance = Cron.getCron();
    job.firstTick = options.firstTick || noop;
    job.tick = options.tick || noop;
    job.lastTick = options.lastTick || noop;
    job.internalId = options.id;
    job.internalJob = cron.schedule(options.frequency, () => {
      const currentTime = new Date().getTime();
      const endTime = options.endTime ? options.endTime : Number.POSITIVE_INFINITY;
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

  private internalId: string;
  private firstTick: tickCallback;
  private tick: tickCallback;
  private lastTick: tickCallback;
  private internalJob: ScheduledTask;
  private constructor() {}

  get id(): string {
    return this.internalId;
  }

  public start(): void {
    Cron.getCron().start(this.id);
  }

  public stop(): void {
    Cron.getCron().stop(this.id);
  }

  public destroy(): void {
    Cron.getCron().destroy(this.id);
  }
}
