import { GenerateFactory } from '../../../../lib/models/commands/generate/factory';
import { expect } from 'chai';

describe('#GenerateFactory', () => {
  describe('#getCustomFactoryNameToExtend', () => {
    let generateFactory;
    beforeEach(() => {
      generateFactory = new GenerateFactory();
    });

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
    ].forEach((test) => {
      it(test.input, () => {
        expect(
          generateFactory.getCustomFactoryNameToExtend(test.input)
        ).to.equal(test.output);
      });
    });
  });
});
