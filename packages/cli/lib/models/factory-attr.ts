const defaultValuesMap = {
  array: '[]',
  boolean: false,
  number: 0,
  object: '{}',
  string: "''",
};

export default class FactoryAttr {
  public attrName: string;
  public inverseAttr: string;
  public attrType: string;
  public valueType: string;
  public defaultValue: string | boolean | number;
  public factory: string;

  constructor(cmdArg: string) {
    const chunks = cmdArg.split(':');
    if (chunks.length === 1) {
      this.defaultValue = defaultValuesMap.string;
      this.attrType = 'field';
      this.valueType = 'string';
      this.attrName = chunks[0];
    }
    if (chunks.length === 2) {
      this.attrName = chunks[0];
      this.valueType = chunks[1];
      if (chunks[1] in defaultValuesMap) {
        this.defaultValue = defaultValuesMap[chunks[1]];
      }
      this.attrType = 'field';
    }
    if (chunks.length >= 3) {
      if (chunks[1] === 'has-one') {
        this.attrType = 'has-one';
        this.factory = chunks[2];
        this.attrName = chunks[0];
        this.inverseAttr = chunks[3] ? `'${chunks[3]}'` : 'null';
      }
      if (chunks[1] === 'has-many') {
        this.attrType = 'has-many';
        this.factory = chunks[2];
        this.attrName = chunks[0];
        this.inverseAttr = chunks[3] ? `'${chunks[3]}'` : 'null';
      }
    }
  }
}
