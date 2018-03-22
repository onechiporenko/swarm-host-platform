import chai = require('chai');
const {expect} = chai;
import Cron from '../lib/cron';
import {ScheduledTask} from 'node-cron';

describe('#Cron', () => {

  afterEach(() => {
    Cron.cleanCron();
  });

  describe('#getCron', () => {
    it('should return Server-instance', () => {
      expect(Cron.getCron()).to.be.instanceof(Cron);
    });
    it('should not create new instance if old-one exists', () => {
      const cron = Cron.getCron();
      const cron2 = Cron.getCron();
      expect(cron).to.be.equal(cron2);
    });
  });

  describe('#add', () => {
    it('should add a Task', () => {
      const cron = Cron.getCron();
      cron.add('1', {} as ScheduledTask);
      expect(cron.has('1')).to.be.true;
    });
  });

  describe('#has', () => {
    it('should check if Task exists', () => {
      const cron = Cron.getCron();
      expect(cron.has('1')).to.be.false;
      cron.add('1', {} as ScheduledTask);
      expect(cron.has('1')).to.be.true;
    });
  });

  describe('#start', () => {
    it('should start a Task if it exists', done => {
      const cron = Cron.getCron();
      cron.add('1', {
        start() {
          done();
        },
      } as ScheduledTask);
      cron.start('1');
    });
  });

  describe('#stop', () => {
    it('should stop a Task if it exists', done => {
      const cron = Cron.getCron();
      cron.add('1', {
        stop() {
          done();
        },
      } as ScheduledTask);
      cron.stop('1');
    });
  });

  describe('#destroy', () => {
    it('should destroy a Task if it exists', done => {
      const cron = Cron.getCron();
      cron.add('1', {
        destroy() {
          done();
        },
      } as ScheduledTask);
      cron.destroy('1');
      expect(cron.has('1')).to.be.false;
    });
  });

});
