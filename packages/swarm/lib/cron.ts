import { ScheduledTask } from 'node-cron';

const { hasOwnProperty } = Object;

export default class Cron {
  public static getCron(): Cron {
    if (!Cron.instance) {
      Cron.instance = new Cron();
    }
    return Cron.instance;
  }

  public static cleanCron(): void {
    Cron.instance = new Cron();
  }

  private static instance: Cron;

  private tasks: { [key: string]: ScheduledTask };

  private constructor() {
    this.tasks = {};
  }

  public add(id: string, job: ScheduledTask): void {
    this.tasks[id] = job;
  }

  public has(id: string): boolean {
    return hasOwnProperty.call(this.tasks, id);
  }

  public start(id: string): void {
    const task = this.tasks[id];
    if (task) {
      task.start();
    }
  }

  public stop(id: string): void {
    const job = this.tasks[id];
    if (job) {
      job.stop();
    }
  }

  public destroy(id: string): void {
    const job = this.tasks[id];
    if (job) {
      job.destroy();
      delete this.tasks[id];
    }
  }
}
