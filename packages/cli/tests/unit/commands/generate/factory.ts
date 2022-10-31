import { expect } from 'chai';
import { GenerateFactory } from '../../../../lib/models/commands/generate/factory';
import { FactoryInstance } from '../../../../lib/models/instances/factory';
import sinon = require('sinon');

let generateFactory;

describe('#GenerateFactory', () => {
  beforeEach(() => (generateFactory = new GenerateFactory()));

  describe('#getCustomFactoryNameToExtend', () => {
    [
      {
        input: 'some/nested/path',
        output: 'SomeNestedPathFactory',
      },
      {
        input: 'path',
        output: 'PathFactory',
      },
      {
        input: 'some-long-path',
        output: 'SomeLongPathFactory',
      },
      {
        input: 'some/nested-very/long-path',
        output: 'SomeNestedVeryLongPathFactory',
      },
      {
        input: 'some-very-long-name',
        output: 'SomeVeryLongNameFactory',
      },
    ].forEach((test) => {
      it(test.input, () => {
        expect(
          generateFactory.getCustomFactoryNameToExtend(test.input)
        ).to.equal(test.output);
      });
    });
  });

  describe('#getRelativePathForExtend', () => {
    [
      {
        m: 'Same level without nesting',
        child: 'child',
        parent: 'parent',
        expected: './parent',
      },
      {
        m: 'Nested child, not nested parent',
        child: 'relative/child',
        parent: 'parent',
        expected: '../parent',
      },
      {
        m: 'Nested x2 child, not nested parent',
        child: 'nested/relative/child',
        parent: 'parent',
        expected: '../../parent',
      },
      {
        m: 'Not nested child, nested parent',
        child: 'child',
        parent: 'relative/parent',
        expected: './relative/parent',
      },
      {
        m: 'Not nested child, nested x2 parent',
        child: 'child',
        parent: 'nested/relative/parent',
        expected: './nested/relative/parent',
      },
      {
        m: 'Nested child and parent (different)',
        child: 'relative1/child',
        parent: 'relative2/parent',
        expected: '../relative2/parent',
      },
      {
        m: 'Nested child, nested x2 parent',
        child: 'relative1/child',
        parent: 'nested/relative2/parent',
        expected: '../nested/relative2/parent',
      },
      {
        m: 'Nested x2 child, nested parent',
        child: 'nested/relative1/child',
        parent: 'relative2/parent',
        expected: '../../relative2/parent',
      },
      {
        m: 'Nested child and parent (same)',
        child: 'relative/child',
        parent: 'relative/parent',
        expected: './parent',
      },
    ].forEach((test) => {
      it(test.m, () => {
        expect(
          generateFactory.getRelativePathForExtend(test.child, test.parent)
        ).to.equal(test.expected);
      });
    });
  });

  describe('#getImportPathForTestFile', () => {
    [
      {
        m: 'top-level factory',
        path: 'top-level',
        e: '../../../app/factories/top-level',
      },
      {
        m: 'one level deep factory',
        path: 'nested/one',
        e: '../../../../app/factories/nested/one',
      },
      {
        m: 'two levels deep factory',
        path: 'nested/one/two',
        e: '../../../../../app/factories/nested/one/two',
      },
      {
        m: 'three levels deep factory',
        path: 'nested/one/two/three',
        e: '../../../../../../app/factories/nested/one/two/three',
      },
    ].forEach((test) => {
      it(test.m, () => {
        new FactoryInstance(test.path, {}, generateFactory);
        expect(generateFactory.getImportPathForTestFile()).to.be.equal(test.e);
      });
    });
  });

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
              new FactoryInstance(
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
        new FactoryInstance(
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
          .and.to.contain('factories')
          .and.to.contain('app');
      });

      it('should not lint source file', () => {
        new FactoryInstance(
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
        new FactoryInstance(
          'test-path',
          {
            'skip-source': true,
            'skip-lint': false,
            'skip-test': false,
          },
          generateFactory
        );
        generateFactory.lintFiles();
        expect(generateFactory.lintFile.callCount).to.be.equal(1);
        const pathToLint = generateFactory.lintFile.firstCall.args[0];
        expect(pathToLint)
          .to.contain('test-path')
          .and.to.contain('factories')
          .and.to.contain('tests');
      });

      it('should not lint test file', () => {
        new FactoryInstance(
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
