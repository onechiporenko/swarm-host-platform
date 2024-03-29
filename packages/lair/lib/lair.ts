import {
  CreateRecordExtraData,
  CreateRelated,
  Factory,
  FactoryData,
  FieldMetaAttr,
  Meta,
  MetaAttrType,
  RelationshipMetaAttr,
} from './factory';
import {
  arrayRandomItem,
  arrayShuffle,
  assert,
  copy,
  getId,
  getOrCalcValue,
  hasId,
  warn,
} from './utils';
import {
  assertCrudOptions,
  assertHasType,
  assertHasTypes,
  assertLoops,
  getLastItemsCount,
  verbose,
} from './decorators';
import { LairRecord } from './record';
import { Relationships } from './relationships';

function getDefaultCrudOptions(options: CRUDOptions): RelationshipOptions {
  return {
    maxDepth: options.depth || Infinity,
    currentDepth: 1,
    ignoreRelated: options.ignoreRelated || [],
  };
}

const { keys, hasOwnProperty } = Object;
const { isArray } = Array;

export interface InternalDb {
  [factoryName: string]: {
    [recordId: string]: LairRecord;
  };
}

export interface InternalMetaStore {
  [factoryName: string]: Meta;
}

interface AfterCreateItem {
  extraData?: CreateRecordExtraData;
  factoryName?: string;
  id?: string;
}

export interface CRUDOptions {
  depth?: number;
  handleNotAttrs?: boolean;
  ignoreRelated?: string[] | boolean;
}

export interface DevInfoItem {
  count: number;
  id: number;
  meta: InternalMetaStore;
}

export interface DevInfo {
  [factoryName: string]: DevInfoItem;
}

export interface CreateOneData {
  [prop: string]: any;
  id?: string;
}

export interface ParentData {
  attrName: string;
  factoryName: string;
}

export interface RelationshipOptions {
  currentDepth: number;
  ignoreRelated: string[] | boolean;
  maxDepth: number;
}

export interface RelatedFor {
  attrName: string;
  factoryName: string;
  id: string;
}

export class Lair {
  private static instance: Lair;

  public meta: InternalMetaStore = {};
  public verbose = false;

  private afterCreateQueue: AfterCreateItem[] = [];
  private db: InternalDb = {};
  private factories: { [id: string]: FactoryData } = {};
  private relationships: Relationships;

  private constructor() {
    this.relationships = new Relationships();
  }

  /**
   * It will drop existing database and unregister all factories
   */
  public static cleanLair(opts = { soft: false }): void {
    const lair = Lair.getLair();
    const factoriesCopy = {};
    lair.meta = {};
    lair.db = {};
    lair.relationships = new Relationships();
    if (opts.soft) {
      keys(lair.factories).forEach((k) => {
        factoriesCopy[k] = lair.factories[k].factory;
      });
      lair.factories = {};
      keys(factoriesCopy).forEach((k) => {
        lair.registerFactory(factoriesCopy[k]);
      });
    } else {
      lair.factories = {};
    }
  }

  /**
   * Lair implements singleton-pattern
   * Use this method to get its instance
   */
  public static getLair(): Lair {
    if (!Lair.instance) {
      Lair.instance = new Lair();
    }
    return Lair.instance;
  }

  /**
   * Create one record of needed factory
   * ID is auto generated for new record. Don't include it to `data` (`data.id` will be skipped)
   * All `data`-fields than not declared in the factory will be skipped
   * Relationships with records of other factories will be automatically updated.
   * Important! All related records should already be in the db
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public createOne(
    factoryName: string,
    data: CreateOneData,
    options: CRUDOptions = {}
  ): LairRecord {
    const opts = getDefaultCrudOptions(options);
    const meta = this.getMetaFor(factoryName);
    const id = this.factories[factoryName].factory.allowCustomIds
      ? data.id
      : String(this.factories[factoryName].id);
    const factory = this.factories[factoryName].factory;
    this.relationships.addRecord(factoryName, id);
    const newRecord = { id, ...factory.getDefaults() };
    keys(data).forEach((attrName) => {
      if (hasOwnProperty.call(meta, attrName)) {
        newRecord[attrName] = this.createAttrValue(
          factoryName,
          id,
          attrName,
          data[attrName]
        );
      } else {
        if (options.handleNotAttrs && attrName !== 'id') {
          newRecord[attrName] = data[attrName];
        }
      }
    });
    this.db[factoryName][id] = newRecord;
    this.factories[factoryName].id++;
    return this.getRecordWithRelationships(factoryName, newRecord.id, [], opts);
  }

  /**
   * Create number of records for needed factory and put then to the db
   * This method can be used only for initial db filling
   */
  @verbose
  public createRecords(factoryName: string, count: number): LairRecord[] {
    this.afterCreateQueue = [];
    const newRecords = this.internalCreateRecords(factoryName, count);
    while (this.afterCreateQueue.length) {
      const {
        factoryName: fName,
        id,
        extraData,
      } = this.afterCreateQueue.shift();
      const factory = this.factories[fName].factory;
      const record = this.getRecordWithRelationships(fName, id, [], {
        maxDepth: factory.afterCreateRelationshipsDepth,
        currentDepth: 1,
        ignoreRelated: factory.afterCreateIgnoreRelated || [],
      });
      const newData = factory.afterCreate.call(null, record, extraData);
      keys(factory.meta).forEach((attrName) => {
        if (
          hasOwnProperty.call(newData, attrName) &&
          attrName !== 'id' &&
          factory.meta[attrName].type === MetaAttrType.FIELD
        ) {
          this.db[fName][id][attrName] = newData[attrName];
        }
      });
    }
    return newRecords;
  }

  /**
   * Delete one record of needed factory
   * Relationships with records of other factories will be automatically updated
   */
  @verbose
  @assertHasType
  public deleteOne(factoryName: string, id: string): void {
    delete this.db[factoryName][id];
    this.relationships.deleteRelationshipsForRecord(factoryName, id);
  }

  /**
   * Get all records of needed factory
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public getAll(factoryName: string, options: CRUDOptions = {}): LairRecord[] {
    const opts = getDefaultCrudOptions(options);
    return keys(this.db[factoryName]).map((id) =>
      this.getRecordWithRelationships(factoryName, id, [], opts)
    );
  }

  /**
   * Get one record of needed factory by its id
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public getOne(
    factoryName: string,
    id: string,
    options: CRUDOptions = {}
  ): LairRecord {
    const opts = getDefaultCrudOptions(options);
    return this.getRecordWithRelationships(factoryName, id, [], opts);
  }

  /**
   *  Get one random record of needed factory
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public getRandomOne(
    factoryName: string,
    options: CRUDOptions = {}
  ): LairRecord {
    const opts = getDefaultCrudOptions(options);
    const records = this.db[factoryName];
    const ids = keys(records);
    const id = arrayRandomItem(ids);
    return this.getRecordWithRelationships(factoryName, id, [], opts);
  }

  /**
   * Get a single random record from one of the listed factories
   */
  @verbose
  @assertHasTypes()
  public getRandomOneForFactories(...factories: string[]): {
    factoryName: string;
    record: LairRecord;
  } {
    const records = factories
      .map((factoryName) => ({
        record: this.getRandomOne(factoryName, { ignoreRelated: true }),
        factoryName,
      }))
      .filter((res) => !!res.record);
    return records.length
      ? records[Math.floor(Math.random() * records.length)]
      : { record: null, factoryName: null };
  }

  @verbose
  @assertHasTypes()
  public getRecordsCountForFactories(
    ...factories: string[]
  ): Record<string, number> {
    return factories.reduce((res, factoryName) => {
      res[factoryName] = keys(this.db[factoryName]).length;
      return res;
    }, {});
  }

  /**
   * Load records data from the predefined JSON's to the db
   * This method can be used only for initial db filling
   */
  @verbose
  @assertHasType
  public loadRecords(
    factoryName: string,
    data: Record<string, unknown>[]
  ): void {
    assert(
      `"${factoryName}" must have "allowCustomIds" set to "true"`,
      this.factories[factoryName].factory.allowCustomIds
    );
    data.forEach((item) => {
      this.createOne(factoryName, item);
    });
  }

  /**
   * Filter records of needed factory
   * Callback is called with one parameter - record
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public queryMany(
    factoryName: string,
    clb: (record: LairRecord) => boolean,
    options: CRUDOptions = {}
  ): LairRecord[] {
    const opts = getDefaultCrudOptions(options);
    return keys(this.db[factoryName])
      .filter((id) => clb.call(null, this.db[factoryName][id]))
      .map((id) => this.getRecordWithRelationships(factoryName, id, [], opts));
  }

  /**
   * Filter one record of needed factory
   * Callback is called with one parameter - record
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public queryOne(
    factoryName: string,
    clb: (record: LairRecord) => boolean,
    options: CRUDOptions = {}
  ): LairRecord {
    const opts = getDefaultCrudOptions(options);
    const records = this.db[factoryName];
    const ids = keys(records);
    for (const id of ids) {
      if (clb.call(null, records[id])) {
        return this.getRecordWithRelationships(factoryName, id, [], opts);
      }
    }
    return null;
  }

  /**
   * Get a list of random records matching condition
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public queryRandomMany(
    factoryName: string,
    clb: (record: LairRecord) => boolean,
    options: CRUDOptions = {},
    limit = 3
  ): LairRecord[] {
    const opts = getDefaultCrudOptions(options);
    let count = 0;
    return arrayShuffle(keys(this.db[factoryName]))
      .filter((id) => {
        const match = clb.call(null, this.db[factoryName][id]);
        const result = match && count < limit;
        if (result) {
          count++;
        }
        return result;
      })
      .map((id) => this.getRecordWithRelationships(factoryName, id, [], opts));
  }

  /**
   * Filter one random record of needed factory
   * Callback is called with one parameter - record
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public queryRandomOne(
    factoryName: string,
    clb: (record: LairRecord) => boolean,
    options: CRUDOptions = {}
  ): LairRecord {
    const opts = getDefaultCrudOptions(options);
    const records = this.db[factoryName];
    const ids = arrayShuffle(keys(records));
    for (const id of ids) {
      if (clb.call(null, records[id])) {
        return this.getRecordWithRelationships(factoryName, id, [], opts);
      }
    }
    return null;
  }

  /**
   * Randomly link existing records for provided factories
   */
  @verbose
  @assertHasTypes(2)
  public randomizeRelationsForExistingRecords(
    parentFactoryName: string,
    childFactoryName: string,
    opts: { relatedCount?: CreateRelated } = {}
  ): void {
    const parentMeta = this.getMetaFor(parentFactoryName);
    let key = '';
    let relType: MetaAttrType;
    keys(parentMeta).forEach((propName) => {
      if (parentMeta[propName].factoryName === childFactoryName) {
        key = propName;
        relType = parentMeta[propName].type;
      }
    });
    assert(
      `Factories "${parentFactoryName}" and "${childFactoryName}" don't have relations`,
      !!key
    );
    this.getAll(parentFactoryName, { depth: 1 }).forEach((parentRecord) => {
      const relatedCount = opts.relatedCount
        ? getOrCalcValue<number>(
            opts.relatedCount,
            parentRecord,
            parentRecord.id
          )
        : 3;
      const newRelatedRecords =
        relType === MetaAttrType.HAS_ONE
          ? this.getRandomOne(childFactoryName)
          : this.queryRandomMany(
              childFactoryName,
              () => true,
              {},
              relatedCount
            );
      this.updateOne(
        parentFactoryName,
        parentRecord.id,
        { [key]: newRelatedRecords },
        { ignoreRelated: true }
      );
    });
  }

  /**
   * Update one record of needed factory
   * ID and any field from `data` which doesn't exist in the factory's meta will be skipped (same as for `createOne`)
   * Relationships with records of other factories will be automatically updated.
   * Important! All related records should already be in the db
   */
  @verbose
  @assertHasType
  @assertCrudOptions
  public updateOne(
    factoryName: string,
    id: string,
    data: Record<string, any>,
    options: CRUDOptions = {}
  ): LairRecord {
    const opts = getDefaultCrudOptions(options);
    const record = this.getOne(factoryName, id, { depth: 1 });
    assert(
      `Record of "${factoryName}" with id "${id}" doesn't exist`,
      !!record
    );
    const meta = this.getMetaFor(factoryName);
    keys(data).forEach((attrName) => {
      if (attrName === 'id') {
        return;
      }
      if (hasOwnProperty.call(meta, attrName)) {
        record[attrName] = this.createAttrValue(
          factoryName,
          id,
          attrName,
          data[attrName]
        );
      } else {
        if (options.handleNotAttrs && attrName !== 'id') {
          record[attrName] = data[attrName];
        }
      }
    });
    this.db[factoryName][id] = record;
    return this.getRecordWithRelationships(factoryName, record.id, [], opts);
  }

  /**
   * Get info about current Lair state:
   *  - Registered factories
   *  - ID-value for each factory
   *  - Records count for each factory
   *  - Meta-info for each factory
   */
  public getDevInfo(): DevInfo {
    const ret = {};
    keys(this.factories).forEach((factoryName) => {
      ret[factoryName] = {
        count: keys(this.db[factoryName]).length,
        id: this.factories[factoryName].id,
        meta: copy(this.getMetaFor(factoryName)),
      };
    });
    return ret;
  }

  public getMetaFor(factoryNameOrClass: any): Meta {
    const metaForFactoryName = this.meta[factoryNameOrClass];
    if (metaForFactoryName) {
      return metaForFactoryName;
    }
    const factoryName = keys(this.factories).find(
      (factoryName) =>
        this.factories[factoryName].factory === factoryNameOrClass
    );
    return factoryName ? this.meta[factoryName] : undefined;
  }

  /**
   * Register factory instance in the Lair
   * Lair works only with registered factories
   */
  public registerFactory(
    factoryInstanceOrClass: Factory | typeof Factory
  ): void {
    const factory =
      factoryInstanceOrClass instanceof Factory
        ? factoryInstanceOrClass
        : new factoryInstanceOrClass();
    const name = factory.getFactoryName();
    assert(
      'Factory name must be defined in the `Factory` child-class as a static property "factoryName"',
      !!name
    );
    assert(
      `Factory with name "${name}" is already registered`,
      !this.factories[name]
    );
    this.factories[name] = { factory, id: 1 } as FactoryData;
    this.meta[name] = factory.meta;
    this.relationships.addFactory(name);
    this.relationships.updateMeta(this.meta);
    this.addType(name);
  }

  private addType(type: string): void {
    this.db[type] = {};
  }

  private createAttrValue(
    factoryName: string,
    id: string,
    attrName: string,
    val: string | string[]
  ): string | string[] | null {
    const meta = this.getMetaFor(factoryName);
    const attrMeta = meta[attrName] as FieldMetaAttr<any>;
    const { factoryName: distFactoryName, invertedAttrName: distAttrName } =
      attrMeta;
    const distMeta = this.getMetaFor(distFactoryName);
    if (attrMeta.type === MetaAttrType.HAS_MANY) {
      if (distMeta[distAttrName]) {
        if (distMeta[distAttrName].type === MetaAttrType.HAS_ONE) {
          return this.createManyToOneAttrValue(
            factoryName,
            id,
            attrName,
            val as string[],
            distFactoryName,
            distAttrName
          );
        }
        if (distMeta[distAttrName].type === MetaAttrType.HAS_MANY) {
          return this.createManyToManyAttrValue(
            factoryName,
            id,
            attrName,
            val as string[],
            distFactoryName,
            distAttrName
          );
        }
      } else {
        this.relationships.setMany(factoryName, id, attrName, val as string[]);
      }
    }
    if (attrMeta.type === MetaAttrType.HAS_ONE) {
      if (distMeta[distAttrName]) {
        if (distMeta[distAttrName].type === MetaAttrType.HAS_ONE) {
          return this.createOneToOneAttrValue(
            factoryName,
            id,
            attrName,
            val as string,
            distFactoryName,
            distAttrName
          );
        }
        if (distMeta[distAttrName].type === MetaAttrType.HAS_MANY) {
          return this.createOneToManyAttrValue(
            factoryName,
            id,
            attrName,
            val as string,
            distFactoryName,
            distAttrName
          );
        }
      } else {
        this.relationships.setOne(factoryName, id, attrName, val as string);
      }
    }
    if (attrMeta.allowedValues && attrMeta.allowedValues.length) {
      assert(
        `"${attrName}" must be one of the "${attrMeta.allowedValues}". You passed "${val}"`,
        attrMeta.allowedValues.indexOf(val) !== -1
      );
    }
    warn(
      `"${attrName}" expected to be "${
        attrMeta.preferredType
      }". You passed "${typeof val}"`,
      !attrMeta.preferredType || attrMeta.preferredType === typeof val
    );
    return val;
  }

  private createManyToManyAttrValue(
    factoryName: string,
    id: string,
    attrName: string,
    newDistIds: string[],
    distFactoryName: string,
    distAttrName: string
  ): string[] | null {
    assert(
      `Array of ids should be provided for value of "${attrName}" [many-to-many relationship]`,
      isArray(newDistIds) || newDistIds === null
    );
    if (newDistIds === null || newDistIds.length === 0) {
      this.relationships.deleteRelationshipForAttr(factoryName, id, attrName);
      return [];
    }
    const distIds = newDistIds.map((newDistId) => {
      assert(
        `"${newDistId}" is invalid identifier for record of "${distFactoryName}" [many-to-many relationship]`,
        hasId(newDistId) || this.factories[factoryName].factory.allowCustomIds
      );
      const distId = getId(newDistId);
      assert(
        `Record of "${distFactoryName}" with id "${distId}" doesn't exist. Create it first [many-to-many relationship]`,
        !!this.db[distFactoryName][distId]
      );
      return distId;
    });
    this.relationships.createManyToMany(
      factoryName,
      id,
      attrName,
      distIds,
      distFactoryName,
      distAttrName
    );
    return newDistIds;
  }

  private createManyToOneAttrValue(
    factoryName: string,
    id: string,
    attrName: string,
    newDistIds: string[],
    distFactoryName: string,
    distAttrName: string
  ): string[] | null {
    assert(
      `Array of ids should be provided for value of "${attrName}" [many-to-one relationship]`,
      isArray(newDistIds) || newDistIds === null
    );
    if (newDistIds === null || newDistIds.length === 0) {
      this.relationships.deleteRelationshipForAttr(factoryName, id, attrName);
      return [];
    }
    const distIds = newDistIds.map((newDistId) => {
      assert(
        `"${newDistId}" is invalid identifier for record of "${distFactoryName}" [many-to-one relationship]`,
        hasId(newDistId) || this.factories[factoryName].factory.allowCustomIds
      );
      const distId = getId(newDistId);
      assert(
        `Record of "${distFactoryName}" with id "${distId}" doesn't exist. Create it first [many-to-one relationship]`,
        !!this.db[distFactoryName][distId]
      );
      return distId;
    });
    this.relationships.createManyToOne(
      factoryName,
      id,
      attrName,
      distIds,
      distFactoryName,
      distAttrName
    );
    return distIds;
  }

  private createOneToManyAttrValue(
    factoryName: string,
    id: string,
    attrName: string,
    newDistId: string,
    distFactoryName: string,
    distAttrName: string
  ): string | null {
    if (newDistId === null) {
      this.relationships.deleteRelationshipForAttr(factoryName, id, attrName);
      return null;
    }
    assert(
      `"${newDistId}" is invalid identifier for record of "${distFactoryName}" [one-to-many relationship]`,
      hasId(newDistId) || this.factories[factoryName].factory.allowCustomIds
    );
    const distId = getId(newDistId);
    assert(
      `Record of "${distFactoryName}" with id "${distId}" doesn't exist. Create it first [one-to-many relationship]`,
      !!this.db[distFactoryName][distId]
    );
    this.relationships.createOneToMany(
      factoryName,
      id,
      attrName,
      distId,
      distFactoryName,
      distAttrName
    );
    return distId;
  }

  private createOneToOneAttrValue(
    factoryName: string,
    id: string,
    attrName: string,
    newDistId: string,
    distFactoryName: string,
    distAttrName: string
  ): string | null {
    if (newDistId === null) {
      this.relationships.deleteRelationshipForAttr(factoryName, id, attrName);
      return null;
    }
    assert(
      `"${newDistId}" is invalid identifier for record of "${distFactoryName}" [one-to-one relationship]`,
      hasId(newDistId) || this.factories[factoryName].factory.allowCustomIds
    );
    const distId = getId(newDistId);
    assert(
      `Record of "${distFactoryName}" with id "${distId}" doesn't exist. Create it first [one-to-one relationship]`,
      !!this.db[distFactoryName][distId]
    );
    this.relationships.createOneToOne(
      factoryName,
      id,
      attrName,
      distId,
      distFactoryName,
      distAttrName
    );
    return distId;
  }

  private getRecordWithRelationships(
    factoryName: string,
    id: string,
    relatedFor: RelatedFor[] = [],
    options: RelationshipOptions = {
      maxDepth: Infinity,
      currentDepth: 1,
      ignoreRelated: [],
    }
  ): LairRecord {
    const recordRelationships = this.relationships.getRelationshipsForRecord(
      factoryName,
      id
    );
    const meta = this.getMetaFor(factoryName);
    let record = this.db[factoryName][id];
    if (!record) {
      return null;
    }
    record = copy(record);
    if (options.currentDepth >= options.maxDepth) {
      return { ...record, ...recordRelationships } as LairRecord;
    }
    let ignoreRelated = [];
    if (typeof options.ignoreRelated === 'boolean') {
      ignoreRelated = options.ignoreRelated
        ? this.getRelatedFactoryNames(factoryName)
        : [];
    }
    if (isArray(options.ignoreRelated)) {
      ignoreRelated = options.ignoreRelated;
    }
    if (recordRelationships) {
      keys(recordRelationships).forEach((attrName) => {
        const relatedIds = recordRelationships[attrName];
        const relatedFactoryName = (meta[attrName] as RelationshipMetaAttr)
          .factoryName;
        if (ignoreRelated.indexOf(relatedFactoryName) !== -1) {
          delete record[attrName];
          return;
        }
        if (this.isRelated(factoryName, attrName, relatedFor)) {
          record[attrName] = relatedIds;
        } else {
          const isRelatedFor = [...relatedFor, { factoryName, id, attrName }];
          const opts = { ...options } as RelationshipOptions;
          opts.currentDepth++;
          record[attrName] = isArray(relatedIds)
            ? relatedIds.map((relatedId) =>
                this.getRecordWithRelationships(
                  relatedFactoryName,
                  relatedId,
                  isRelatedFor,
                  opts
                )
              )
            : relatedIds
            ? this.getRecordWithRelationships(
                relatedFactoryName,
                relatedIds,
                isRelatedFor,
                opts
              )
            : null;
        }
      });
    }
    return record;
  }

  private getRelatedFactoryNames(factoryName: string): string[] {
    const metaForFactory = this.getMetaFor(factoryName);
    const relatedFactoryNames = [];
    keys(metaForFactory).forEach((fieldName: string) => {
      if (metaForFactory[fieldName].factoryName) {
        relatedFactoryNames.push(metaForFactory[fieldName].factoryName);
      }
    });
    return relatedFactoryNames;
  }

  private hasType(type: string): boolean {
    return !!this.db[type];
  }

  private internalCreateRecords(
    factoryName: string,
    count: number,
    parentData: ParentData = { factoryName: '', attrName: '' },
    relatedChain: string[] = []
  ): LairRecord[] {
    assert(
      `Factory with name "${factoryName}" is not registered`,
      !!this.factories[factoryName]
    );
    if (factoryName === parentData.factoryName) {
      // try to check reflexive relationships
      const m = this.getMetaFor(parentData.factoryName);
      const attrMeta = m[parentData.attrName] as RelationshipMetaAttr;
      if (attrMeta.reflexive) {
        const depth = attrMeta.reflexiveDepth;
        const alreadyCreatedCount = getLastItemsCount(
          relatedChain,
          factoryName
        );
        if (depth === alreadyCreatedCount) {
          return [];
        }
      } else {
        assertLoops(parentData.factoryName, relatedChain);
      }
    } else {
      // check factories as usual
      assertLoops(factoryName, relatedChain);
    }
    const factoryData = this.factories[factoryName];
    const { meta } = factoryData.factory;
    const newRecords = [];
    let counter = 1;
    for (let i = 0; i < count; i++) {
      const relatedTo = relatedChain.length
        ? {
            currentRecordNumber: counter,
            factoryName: relatedChain[relatedChain.length - 1],
            recordsCount: count,
          }
        : {};
      const extraData = { relatedTo } as CreateRecordExtraData;
      const record = factoryData.factory.createRecord(
        this.factories[factoryName].id,
        extraData
      );
      this.relationships.addRecord(factoryName, record.id);
      this.db[factoryName][record.id] = record;
      newRecords.push(record);
      this.factories[factoryName].id++;
      this.afterCreateQueue.push({ factoryName, id: record.id, extraData });
      keys(meta).forEach((attrName) => {
        const isHasMany = meta[attrName].type === MetaAttrType.HAS_MANY;
        const createRelated = meta[attrName].createRelated;
        const useExistingAsRelated = meta[attrName].useExistingAsRelated;
        if (!createRelated && !useExistingAsRelated) {
          return;
        }
        const fName = (meta[attrName] as RelationshipMetaAttr).factoryName;
        let relatedCount;
        let relatedRecords = [];
        if (createRelated) {
          relatedCount = isHasMany
            ? getOrCalcValue<number>(createRelated, record, record.id)
            : 1;
          relatedRecords = this.internalCreateRecords(
            fName,
            relatedCount,
            { factoryName, attrName },
            [...relatedChain, factoryName]
          );
        }
        if (useExistingAsRelated) {
          relatedCount = isHasMany
            ? getOrCalcValue<number>(useExistingAsRelated, record, record.id)
            : 1;
          const existingRecords = Object.values(this.db[fName]);
          if (existingRecords.length < relatedCount) {
            console.warn(
              `Attr "${factoryName}.${attrName}" requires ${relatedCount} records of "${fName}", however only ${existingRecords.length} are available.`
            );
            relatedRecords = existingRecords;
          } else {
            relatedRecords = existingRecords
              .sort(() => Math.random() - 0.5)
              .slice(0, relatedCount);
          }
        }
        this.db[factoryName][record.id][attrName] = isHasMany
          ? relatedRecords
          : relatedRecords[0];
      });
      this.relationships.recalculateRelationshipsForRecord(
        factoryName,
        this.db[factoryName][record.id]
      );
      counter++;
    }
    return newRecords;
  }

  private isRelated(
    factoryName: string,
    attrName: string,
    relatedFor: RelatedFor[] = []
  ): boolean {
    const meta = this.getMetaFor(factoryName);
    const attrMeta = meta[attrName] as RelationshipMetaAttr;
    const relatedFactoryName = attrMeta.factoryName;
    return relatedFor.some(
      (r) =>
        r.factoryName === relatedFactoryName &&
        r.attrName &&
        r.attrName === attrMeta.invertedAttrName
    );
  }
}
