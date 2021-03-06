import sinon = require('sinon');
import { expect } from 'chai';
import Cron from '../lib/cron';
import Job, { JobOptions } from '../lib/job';

const jobId = '1';
let clock;

describe('#Job', () => {
  beforeEach(() => {
    const initialDate = new Date();
    initialDate.setMinutes(0);
    initialDate.setHours(0);
    initialDate.setSeconds(0);
    clock = sinon.useFakeTimers(initialDate.getTime());
  });

  afterEach(() => {
    Cron.getCron().destroy(jobId);
    clock.restore();
  });

  describe('#createJob', () => {
    it('should throw an Error if `ticksCount` is not greater than 0', () => {
      expect(() => Job.createJob({ ticksCount: 0 } as JobOptions)).to.throw(
        '"options.ticksCount" must be greater than 0'
      );
      expect(() =>
        Job.createJob({
          frequency: '1 * * * *',
          ticksCount: 1,
          id: jobId,
        } as JobOptions)
      ).to.not.throw();
    });
    it('should return a Job instance', () => {
      expect(
        Job.createJob({
          frequency: '1 * * * *',
          ticksCount: 1,
          id: jobId,
        } as JobOptions)
      ).to.be.instanceof(Job);
    });
  });

  describe('#createJob job run', () => {
    it('should execute all ticks', (done) => {
      let executed = 0;
      Job.createJob({
        id: jobId,
        frequency: '1 * * * *',
        ticksDelay: 4,
        ticksCount: 5,
        firstTick(): void {
          executed++;
        },
        tick(): void {
          executed++;
        },
        lastTick(): void {
          executed++;
          expect(executed).to.equal(7);
          done();
        },
      } as JobOptions);
      clock.tick(1000 * 60 * 2);
    });

    it('each returned from tick value is passed to the next tick', (done) => {
      Job.createJob({
        id: jobId,
        frequency: '1 * * * *',
        ticksDelay: 4,
        ticksCount: 5,
        firstTick(): string {
          return '1';
        },
        tick(val: string): string {
          expect(val).to.be.equal('1');
          return val;
        },
        lastTick(val: string): void {
          expect(val).to.be.equal('1');
          done();
        },
      } as JobOptions);
      clock.tick(1000 * 60 * 2);
    });

    it('each tick should take two arguments', (done) => {
      let indx = 1;
      Job.createJob({
        id: jobId,
        frequency: '1 * * * *',
        ticksDelay: 4,
        ticksCount: 5,
        tick(val: any, index: number): void {
          expect(index).to.be.equal(indx++);
        },
        lastTick(): void {
          indx = 1;
          done();
        },
      } as JobOptions);
      clock.tick(1000 * 60 * 2);
    });

    it('should not execute a job if its endTime is before current time', () => {
      expect(() => {
        Job.createJob({
          id: jobId,
          frequency: '1 * * * *',
          ticksCount: 4,
          ticksDelay: 5,
          endTime: 1,
          firstTick(): void {
            throw new Error('should not be called');
          },
        } as JobOptions);
        clock.tick(1000 * 60 * 2);
      }).to.not.throw();
    });

    it('should stop execution if job is already destroyed (not even start)', (done) => {
      expect(() => {
        let executed = 0;
        Job.createJob({
          id: jobId,
          frequency: '1 * * * *',
          ticksCount: 1,
          ticksDelay: 10,
          firstTick(): void {
            throw new Error('should not be executed');
          },
          tick(): void {
            executed++;
          },
          lastTick(): void {
            executed++;
          },
        } as JobOptions);
        Cron.getCron().destroy(jobId);
        clock.tick(1000 * 60);
        expect(executed).to.be.equal(0);
        done();
      }).to.not.throw();
    });

    it('should stop execution if job is already destroyed (only firstTick)', (done) => {
      expect(() => {
        let executed = 0;
        Job.createJob({
          id: jobId,
          frequency: '1 * * * *',
          ticksCount: 1,
          ticksDelay: 1,
          firstTick(): void {
            executed++;
          },
          tick(): void {
            Cron.getCron().destroy(jobId);
          },
          lastTick(): void {
            executed++;
          },
        } as JobOptions);
        clock.tick(1000 * 60 * 2);
        expect(executed).to.be.equal(1);
        done();
      }).to.not.throw();
    });
  });
});
