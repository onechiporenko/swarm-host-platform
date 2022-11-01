import { expect } from 'chai';
import { GenerateRoute } from '../../../../lib/models/commands/generate/route';
import { RouteInstance } from '../../../../lib/models/instances/route';
import sinon = require('sinon');

let generateFactory;

describe('#RouteFactory', () => {
  beforeEach(() => (generateFactory = new GenerateRoute()));

  describe('Linting', () => {
    beforeEach(() => sinon.stub(generateFactory, 'lintFile'));

    afterEach(() => generateFactory.lintFile.restore());

    describe('asset linting', () => {
      [
        {
          linterExists: true,
          skipLint: true,
          expected: false,
        },
        {
          linterExists: true,
          skipLint: false,
          expected: false,
        },
        {
          linterExists: false,
          skipLint: true,
          expected: false,
        },
        {
          linterExists: false,
          skipLint: false,
          expected: true,
        },
      ].forEach((t) => {
        describe(`Linter exists: ${t.linterExists}, skip lint: ${t.skipLint}`, () => {
          beforeEach(() =>
            sinon
              .stub(generateFactory, 'linterInstalled')
              .returns(t.linterExists)
          );

          afterEach(() => generateFactory.linterInstalled.restore());

          it(
            t.expected ? 'Should throw and error' : 'Should not throw an error',
            () => {
              new RouteInstance(
                'test-path',
                {
                  'skip-lint': t.skipLint,
                },
                generateFactory
              );
              if (t.expected) {
                expect(() => {
                  generateFactory.lintFiles();
                }).to.throw('Linter is missing');
              } else {
                expect(() => {
                  generateFactory.lintFiles();
                }).not.to.throw('Linter is missing');
              }
            }
          );
        });
      });
    });

    describe('source file', () => {
      beforeEach(() =>
        sinon.stub(generateFactory, 'linterInstalled').returns(true)
      );
      afterEach(() => generateFactory.linterInstalled.restore());
      it('should lint source file', () => {
        new RouteInstance(
          'test-path',
          {
            'skip-source': false,
            'skip-lint': false,
            'skip-test': true,
          },
          generateFactory
        );
        generateFactory.lintFiles();
        expect(generateFactory.lintFile.callCount).to.be.equal(1);
        const pathToLint = generateFactory.lintFile.firstCall.args[0];
        expect(pathToLint)
          .to.contain('test-path')
          .and.to.contain('routes')
          .and.to.contain('app');
      });

      it('should not lint source file', () => {
        new RouteInstance(
          'test-path',
          {
            'skip-source': false,
            'skip-lint': true,
            'skip-test': true,
          },
          generateFactory
        );
        generateFactory.lintFiles();
        expect(generateFactory.lintFile.callCount).to.be.equal(0);
      });
    });

    describe('test file', () => {
      beforeEach(() =>
        sinon.stub(generateFactory, 'linterInstalled').returns(true)
      );
      afterEach(() => generateFactory.linterInstalled.restore());
      it('should lint test file', () => {
        new RouteInstance(
          'test-path',
          {
            'skip-source': true,
            'skip-lint': false,
            'skip-test': false,
          },
          generateFactory
        );
        generateFactory.lintFiles();
        expect(generateFactory.lintFile.callCount).to.be.equal(2);
        const pathToLint = generateFactory.lintFile.firstCall.args[0];
        expect(pathToLint)
          .to.contain('test-path')
          .and.to.contain('routes')
          .and.to.contain('tests');
      });

      it('should not lint test file', () => {
        new RouteInstance(
          'test-path',
          {
            'skip-source': false,
            'skip-lint': true,
            'skip-test': false,
          },
          generateFactory
        );
        generateFactory.lintFiles();
        expect(generateFactory.lintFile.callCount).to.be.equal(0);
      });
    });

    describe('schema file', () => {
      beforeEach(() =>
        sinon.stub(generateFactory, 'linterInstalled').returns(true)
      );
      afterEach(() => generateFactory.linterInstalled.restore());
      it('should lint schema file', () => {
        new RouteInstance(
          'test-path',
          {
            'skip-source': true,
            'skip-lint': false,
            'skip-test': false,
          },
          generateFactory
        );
        generateFactory.lintFiles();
        expect(generateFactory.lintFile.callCount).to.be.equal(2);
        const pathToLint = generateFactory.lintFile.secondCall.args[0];
        expect(pathToLint).to.contain('test-path').and.to.contain('schemas');
      });

      it('should not lint schema file', () => {
        new RouteInstance(
          'test-path',
          {
            'skip-source': false,
            'skip-lint': true,
            'skip-test': false,
          },
          generateFactory
        );
        generateFactory.lintFiles();
        expect(generateFactory.lintFile.callCount).to.be.equal(0);
      });
    });
  });
});
