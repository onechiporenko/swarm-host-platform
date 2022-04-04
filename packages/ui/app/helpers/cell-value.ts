import { typeOf } from '@ember/utils';
import { get } from '@ember/object';
import { helper } from '@ember/component/helper';

export function cellValue([value]: [any] /*, hash*/) {
  const type = typeOf(value);
  if (value && (value as any).map) {
    return (value as any[]).map((v: any) => v.id);
  }
  if (type === 'instance') {
    return get(value, 'id'); // eslint-disable-line ember/no-get
  }
  return value;
}

export default helper(cellValue);
