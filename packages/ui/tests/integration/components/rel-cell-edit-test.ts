import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rel-cell-edit', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{rel-cell-edit}}`);

    assert.strictEqual(this.element.textContent?.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#rel-cell-edit}}
        template block text
      {{/rel-cell-edit}}
    `);

    assert.strictEqual(this.element.textContent?.trim(), 'template block text');
  });
});
