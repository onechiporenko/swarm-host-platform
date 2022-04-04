import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | table-columns', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:table-columns');
    assert.ok(service);
  });
});
