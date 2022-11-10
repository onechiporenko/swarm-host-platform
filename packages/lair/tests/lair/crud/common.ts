import { expect } from 'chai';
import sinon = require('sinon');
import { Factory, field, hasMany, hasOne } from '../../../lib/factory';
import { Lair } from '../../../lib/lair';

let sandbox;
let lair;
let consoleStub;

class FooFactory extends Factory {
  static factoryName = 'foo';
  @field()
  get foo(): string {
    return `foo ${this.id}`;
  }
}

class BarFactory extends Factory {
  static factoryName = 'bar';
  @field()
  get bar(): string {
    return `foo ${this.id}`;
  }
}

describe('Lair', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    lair = Lair.getLair();
  });
  afterEach(() => {
    Lair.cleanLair();
    sandbox.restore();
  });
  describe('DB CRUD', () => {
    describe('common', () => {
      beforeEach(() => {
        lair.registerFactory(new FooFactory());
        lair.registerFactory(new BarFactory());
        lair.createRecords('foo', 5);
        lair.createRecords('bar', 5);
      });

      describe('#getAll', () => {
        it('should return array with all records of needed type', () => {
          expect(lair.getAll('foo')).to.have.property('length', 5);
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.getAll('fake')).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#getOne', () => {
        it('should return record if it exists', () => {
          expect(lair.getOne('foo', '1')).to.have.property('foo', 'foo 1');
        });

        it("should return undefined if record with needed id doesn't exist", () => {
          expect(lair.getOne('foo', '100500')).to.be.null;
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.getOne('fake', '1')).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#getRandomOne', () => {
        it('should return one random record', () => {
          expect(lair.getRandomOne('foo'))
            .to.have.property('id')
            .oneOf(['1', '2', '3', '4', '5']);
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.getRandomOne('fake')).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#queryMany', () => {
        it('should return filtered records', () => {
          expect(
            lair.queryMany('foo', (r) => Number(r.id) > 3)
          ).to.have.property('length', 2);
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.queryMany('fake', (r) => !!r)).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#queryOne', () => {
        it('should return one record', () => {
          expect(
            lair.queryOne('foo', (r) => Number(r.id) > 3)
          ).to.have.property('id', '4');
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.queryOne('fake', (r) => !!r)).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#queryRandomOne', () => {
        it('should return one random record', () => {
          expect(lair.queryRandomOne('foo', (r) => Number(r.id) > 3))
            .to.have.property('id')
            .oneOf(['4', '5']);
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.queryRandomOne('fake', (r) => !!r)).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#queryRandomMany', () => {
        it('should return three random records (by default)', () => {
          expect(
            lair
              .queryRandomMany('foo', (r) => Number(r.id) > 2)
              .map((r) => r.id)
          ).contains.all.members(['3', '4', '5']);
        });

        it('should return asked number of random records', () => {
          const records = lair
            .queryRandomMany('foo', (r) => Number(r.id) > 2, {}, 2)
            .map((r) => r.id);
          expect(records).to.have.length(2);
          expect(records[0]).to.be.oneOf(['3', '4', '5']);
          expect(records[1]).to.be.oneOf(['3', '4', '5']);
        });

        it('should return existing number of random records', () => {
          expect(lair.getAll('foo', { depth: 1 })).to.have.length(5);
          const records = lair
            .queryRandomMany('foo', (r) => true, {}, 10)
            .map((r) => r.id);
          expect(records).to.have.length(5);
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.queryRandomMany('fake', (r) => !!r)).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#deleteOne', () => {
        it('should delete record with provided id (no relations)', () => {
          expect(lair.getOne('foo', '1')).to.have.property('id', '1');
          lair.deleteOne('foo', '1');
          expect(lair.getOne('foo', '1')).to.be.null;
        });

        it('should delete record with provided id (with two-ways relations)', () => {
          class Foo1Factory extends Factory {
            static factoryName = 'foo1';
            @hasOne('bar1', 'foo1', {
              createRelated: 1,
            })
            bar1;
          }
          class Bar1Factory extends Factory {
            static factoryName = 'bar1';
            @hasOne('foo1', 'bar1') foo1;
          }
          lair.registerFactory(new Foo1Factory());
          lair.registerFactory(new Bar1Factory());
          lair.createRecords('foo1', 1);
          expect(lair.getOne('foo1', '1')).to.have.property('id', '1');
          lair.deleteOne('foo1', '1');
          expect(lair.getOne('foo1', '1')).to.be.null;
        });

        it('should delete record with provided id (with one-way relations) [hasOne]', () => {
          class Foo2Factory extends Factory {
            static factoryName = 'foo2';
            @hasOne('bar2', 'foo2', {
              createRelated: 1,
            })
            bar2;
          }
          class Bar2Factory extends Factory {
            static factoryName = 'bar2';
            @hasOne('foo2', 'bar2') foo2;
          }
          lair.registerFactory(new Foo2Factory());
          lair.registerFactory(new Bar2Factory());
          lair.createRecords('foo2', 1);
          expect(lair.getOne('foo2', '1')).to.have.property('id', '1');
          lair.deleteOne('foo2', '1');
          expect(lair.getOne('foo2', '1')).to.be.null;
        });

        it('should delete record with provided id (with one-way relations) [hasOne] [2]', () => {
          class Foo3Factory extends Factory {
            static factoryName = 'foo3';
            @hasOne('bar3', 'foo3', {
              createRelated: 1,
            })
            bar3;
          }
          class Bar3Factory extends Factory {
            static factoryName = 'bar3';
            @hasOne('foo3', 'bar3') foo3;
          }
          lair.registerFactory(new Foo3Factory());
          lair.registerFactory(new Bar3Factory());
          lair.createRecords('foo3', 1);
          expect(lair.getOne('foo3', '1')).to.have.property('id', '1');
          lair.deleteOne('foo3', '1');
          expect(lair.getOne('foo3', '1')).to.be.null;
        });

        it('should delete record with provided id (with one-way relations) [hasMany]', () => {
          class Foo4Factory extends Factory {
            static factoryName = 'foo4';
            @hasMany('bar4', null, {
              createRelated: 1,
            })
            bar4;
          }
          class Bar4Factory extends Factory {
            static factoryName = 'bar4';
            @hasOne('foo4', 'bar4') foo4;
          }
          lair.registerFactory(new Foo4Factory());
          lair.registerFactory(new Bar4Factory());
          lair.createRecords('foo4', 1);
          expect(lair.getOne('foo4', '1')).to.have.property('id', '1');
          lair.deleteOne('foo4', '1');
          expect(lair.getOne('foo4', '1')).to.be.null;
        });

        it('should delete record with provided id (with one-way relations) [hasMany] [2]', () => {
          class Foo5Factory extends Factory {
            static factoryName = 'foo5';
            @hasMany('bar5', 'foo5', {
              createRelated: 1,
            })
            bar5;
          }
          class Bar5Factory extends Factory {
            static factoryName = 'bar5';
            @hasOne('foo5', null) foo5;
          }
          lair.registerFactory(new Foo5Factory());
          lair.registerFactory(new Bar5Factory());
          lair.createRecords('foo5', 1);
          expect(lair.getOne('foo5', '1')).to.have.property('id', '1');
          lair.deleteOne('foo5', '1');
          expect(lair.getOne('foo5', '1')).to.be.null;
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.deleteOne('fake', '1')).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });
      });

      describe('#createOne', () => {
        beforeEach(() => {
          consoleStub = sandbox.stub(console, 'warn');
        });

        it('should create record in the database', () => {
          lair.createOne('foo', { foo: 'unique foo' });
          expect(lair.getOne('foo', '6')).to.have.property('id', '6');
        });

        it('should return created record', () => {
          const record = lair.createOne('foo', { foo: 'super unique foo' });
          expect(record).to.have.property('id', '6');
          expect(record).to.have.property('foo', 'super unique foo');
        });

        it('should ignore properties not declared in factory.attrs', () => {
          const record = lair.createOne('foo', { fake: 'fake' });
          expect(record).to.not.have.property('fake');
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.createOne('fake', {})).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });

        it('should process not defined attributes if `handleNotAttrs`-option is set', () => {
          const record = lair.createOne(
            'foo',
            { foo: 'foo', fake: 'fake' },
            { handleNotAttrs: true }
          );
          expect(record).to.be.eql({
            id: '6',
            foo: 'foo',
            fake: 'fake',
          });
        });

        it('should create record with default values', () => {
          class Baz1CreateOneFactory extends Factory {
            static factoryName = 'baz1';
            @field({
              defaultValue: 'b',
            })
            a = 'a';
          }
          lair.registerFactory(new Baz1CreateOneFactory());
          expect(lair.createOne('baz1', {})).to.have.property('a', 'b');
        });

        it('should create record with custom id if `allowCustomIds` is `true`', () => {
          class Baz2CreateOneFactory extends Factory {
            static factoryName = 'baz2';
            allowCustomIds = true;
          }
          lair.registerFactory(new Baz2CreateOneFactory());
          expect(lair.createOne('baz2', { id: 'custom_id' })).to.have.property(
            'id',
            'custom_id'
          );
        });

        it('should throw an error if value for field is not exist in the `allowedValues`', () => {
          class Baz3CreateOneFactory extends Factory {
            static factoryName = 'baz3';
            @field({
              allowedValues: [1, 2, 3],
            })
            a = 1;
          }
          lair.registerFactory(new Baz3CreateOneFactory());
          expect(() => lair.createOne('baz3', { a: 4 })).to.throw(
            `"a" must be one of the "1,2,3". You passed "4"`
          );
        });

        it('should warn user if preferredType for field mismatch provided value', () => {
          class Baz4CreateOneFactory extends Factory {
            static factoryName = 'baz4';
            @field({
              preferredType: 'number',
            })
            a = 1;
          }
          lair.registerFactory(new Baz4CreateOneFactory());
          lair.createOne('baz4', { a: '2' });
          sinon.assert.calledWith(
            consoleStub,
            '"a" expected to be "number". You passed "string"'
          );
        });
      });

      describe('#updateOne', () => {
        beforeEach(() => {
          consoleStub = sandbox.stub(console, 'warn');
        });

        it('should update record in the database', () => {
          lair.updateOne('foo', '1', { foo: 'updated foo' });
          expect(lair.getOne('foo', '1')).to.have.property(
            'foo',
            'updated foo'
          );
        });

        it('should return updated record', () => {
          const record = lair.updateOne('foo', '1', { foo: 'updated foo' });
          expect(record).to.have.property('id', '1');
          expect(record).to.have.property('foo', 'updated foo');
        });

        it('should ignore properties not declared in factory.attrs', () => {
          const record = lair.updateOne('foo', '1', { fake: 'fake' });
          expect(record).to.not.have.property('fake');
        });

        it('should throw an error for unknown type', () => {
          expect(() => lair.updateOne('fake', '1', {})).to.throw(
            '"fake"-type doesn\'t exist in the database'
          );
        });

        it('should ignore `id` updating', () => {
          const record = lair.updateOne('foo', '1', {
            foo: 'updated foo',
            id: '6',
          });
          expect(record.id).to.be.equal('1');
          expect(lair.getAll('foo')).to.have.property('length', 5);
        });

        it('should process not defined attributes if `handleNotAttrs`-option is set', () => {
          lair.updateOne(
            'foo',
            '1',
            { foo: 'foo', fake: 'fake' },
            { handleNotAttrs: true }
          );
          expect(lair.getOne('foo', '1')).to.be.eql({
            id: '1',
            foo: 'foo',
            fake: 'fake',
          });
        });

        it('should not process `id`  if `handleNotAttrs`-option is set', () => {
          expect(
            lair.updateOne(
              'foo',
              '1',
              { id: 'new_id' },
              { handleNotAttrs: true }
            )
          ).to.have.property('id', '1');
        });

        it('should throw an error if value for field is not exist in the `allowedValues`', () => {
          class Baz1UpdateOneFactory extends Factory {
            static factoryName = 'baz1';
            @field({
              allowedValues: [1, 2, 3],
            })
            a = 1;
          }
          lair.registerFactory(new Baz1UpdateOneFactory());
          lair.createRecords('baz1', 1);
          expect(() => lair.updateOne('baz1', '1', { a: 4 })).to.throw(
            `"a" must be one of the "1,2,3". You passed "4"`
          );
        });

        it('should warn user if preferredType for field mismatch provided value', () => {
          class Baz2UpdateOneFactory extends Factory {
            static factoryName = 'baz2';
            @field({
              preferredType: 'number',
            })
            a = 1;
          }
          lair.registerFactory(new Baz2UpdateOneFactory());
          lair.createRecords('baz2', 1);
          lair.updateOne('baz2', '1', { a: '2' });
          sinon.assert.calledWith(
            consoleStub,
            '"a" expected to be "number". You passed "string"'
          );
        });
      });

      describe('#getRandomOneForFactories', () => {
        it('should throw an error if some factory does not exist (1st arg)', () => {
          expect(() => lair.getRandomOneForFactories('not-existing')).to.throw(
            '"not-existing"-type doesn\'t exist in the database'
          );
        });

        it('should throw an error if some factory does not exist (not 1st arg)', () => {
          lair.registerFactory(
            class ExistingFactory extends Factory {
              static factoryName = 'existing';
            }
          );
          expect(() =>
            lair.getRandomOneForFactories('existing', 'not-existing')
          ).to.throw('"not-existing"-type doesn\'t exist in the database');
        });

        it('should return record from factory#1', () => {
          lair.registerFactory(
            class Factory1 extends Factory {
              static factoryName = 'factory1';
            }
          );
          lair.registerFactory(
            class Factory1 extends Factory {
              static factoryName = 'factory2';
            }
          );
          lair.createRecords('factory1', 2);
          const randomRecord = lair.getRandomOneForFactories(
            'factory1',
            'factory2'
          );
          expect(randomRecord.record).to.have.property('id').oneOf(['1', '2']);
          expect(randomRecord.factoryName).to.be.equal('factory1');
        });

        it('should return record from factory#2', () => {
          lair.registerFactory(
            class Factory1 extends Factory {
              static factoryName = 'factory1';
            }
          );
          lair.registerFactory(
            class Factory1 extends Factory {
              static factoryName = 'factory2';
            }
          );
          lair.createRecords('factory2', 2);
          const randomRecord = lair.getRandomOneForFactories(
            'factory1',
            'factory2'
          );
          expect(randomRecord.record).to.have.property('id').oneOf(['1', '2']);
          expect(randomRecord.factoryName).to.be.equal('factory2');
        });

        it('should return nothing if no records are for needed factories', () => {
          lair.registerFactory(
            class Factory1 extends Factory {
              static factoryName = 'factory1';
            }
          );
          lair.registerFactory(
            class Factory1 extends Factory {
              static factoryName = 'factory2';
            }
          );
          const randomRecord = lair.getRandomOneForFactories(
            'factory1',
            'factory2'
          );
          expect(randomRecord).to.have.property('record', null);
          expect(randomRecord).to.have.property('factoryName', null);
        });
      });

      describe('#randomizeRelationsForExistingRecords', () => {
        it('should thrown an error if 1st factory does not exists', () => {
          lair.registerFactory(
            class ChildA1Factory extends Factory {
              static factoryName = 'child';
            }
          );
          expect(() =>
            lair.randomizeRelationsForExistingRecords('parent', 'child')
          ).to.throw('"parent"-type doesn\'t exist in the database');
        });

        it('should thrown an error if 2ns factory does not exists', () => {
          lair.registerFactory(
            class ParentA1Factory extends Factory {
              static factoryName = 'parent';
            }
          );
          expect(() =>
            lair.randomizeRelationsForExistingRecords('parent', 'child')
          ).to.throw('"child"-type doesn\'t exist in the database');
        });

        it('should throw an error if factories are without relations', () => {
          lair.registerFactory(
            class ParentFactory extends Factory {
              static factoryName = 'parent';
            }
          );
          lair.registerFactory(
            class ChildFactory extends Factory {
              static factoryName = 'child';
            }
          );
          expect(() =>
            lair.randomizeRelationsForExistingRecords('parent', 'child')
          ).to.throw('Factories "parent" and "child" don\'t have relations');
        });

        it('one-to-one', () => {
          class ParentOneToOneFactory extends Factory {
            static factoryName = 'parent';
            @hasOne('child', 'parent')
            child;
          }
          class ChildOneToOneFactory extends Factory {
            static factoryName = 'child';
            @hasOne('parent', 'child')
            parent;
          }
          lair.registerFactory(ParentOneToOneFactory);
          lair.registerFactory(ChildOneToOneFactory);
          lair.createRecords('parent', 3);
          lair.createRecords('child', 3);
          lair.randomizeRelationsForExistingRecords('parent', 'child');
          expect(lair.getOne('parent', '1', { depth: 1 }))
            .to.have.property('child')
            .oneOf([null, '1', '2', '3']);
          expect(lair.getOne('parent', '2', { depth: 1 }))
            .to.have.property('child')
            .oneOf([null, '1', '2', '3']);
          const parent3 = lair.getOne('parent', '3', { depth: 1 });
          expect(parent3).to.have.property('child').oneOf(['1', '2', '3']);
          expect(
            lair.getOne('child', parent3.child, { depth: 1 })
          ).to.have.property('parent', parent3.id);
        });

        it('many-to-one', () => {
          class ParentManyToOneFactory extends Factory {
            static factoryName = 'parent';
            @hasMany('child', 'parent')
            children;
          }
          class ChildManyToOneFactory extends Factory {
            static factoryName = 'child';
            @hasOne('parent', 'children')
            parent;
          }
          lair.registerFactory(ParentManyToOneFactory);
          lair.registerFactory(ChildManyToOneFactory);
          lair.createRecords('parent', 2);
          lair.createRecords('child', 100);
          lair.randomizeRelationsForExistingRecords('parent', 'child');
          const parent1 = lair.getOne('parent', '1', { depth: 1 });
          const parent2 = lair.getOne('parent', '2', { depth: 1 });
          expect(parent1).to.have.property('children').that.is.not.empty;
          parent1.children.forEach((child) => {
            expect(lair.getOne('child', child, { depth: 1 })).to.have.property(
              'parent',
              parent1.id
            );
          });
          expect(parent2).to.have.property('children').that.is.not.empty;
          parent2.children.forEach((child) => {
            expect(lair.getOne('child', child, { depth: 1 })).to.have.property(
              'parent',
              parent2.id
            );
          });
        });

        it('one-to-many', () => {
          class ParentOneToManyFactory extends Factory {
            static factoryName = 'parent';
            @hasOne('child', 'parents')
            child;
          }
          class ChildOneToManyFactory extends Factory {
            static factoryName = 'child';
            @hasMany('parent', 'child')
            parents;
          }
          lair.registerFactory(ParentOneToManyFactory);
          lair.registerFactory(ChildOneToManyFactory);
          lair.createRecords('parent', 5);
          lair.createRecords('child', 10);
          lair.randomizeRelationsForExistingRecords('parent', 'child');
          lair.getAll('parent', { depth: 1 }).forEach((r) => {
            expect(r)
              .to.have.property('child')
              .that.satisfies((c) => Number(c) >= 1 && Number(c) <= 10);
            expect(lair.getOne('child', r.child, { depth: 1 }))
              .to.have.property('parents')
              .that.contains(r.id);
          });
        });

        it('many-to-many', () => {
          class ParentManyToManyFactory extends Factory {
            static factoryName = 'parent';
            @hasMany('child', 'parents')
            children;
          }
          class ChildManyToManyFactory extends Factory {
            static factoryName = 'child';
            @hasMany('parent', 'children')
            parents;
          }
          lair.registerFactory(ParentManyToManyFactory);
          lair.registerFactory(ChildManyToManyFactory);
          lair.createRecords('parent', 3);
          lair.createRecords('child', 3);
          lair.randomizeRelationsForExistingRecords('parent', 'child');
          expect(lair.getOne('parent', '1', { depth: 1 }))
            .to.have.property('children')
            .that.contains.all.members(['1', '2', '3']);
          expect(lair.getOne('parent', '2', { depth: 1 }))
            .to.have.property('children')
            .that.contains.all.members(['1', '2', '3']);
          expect(lair.getOne('parent', '3', { depth: 1 }))
            .to.have.property('children')
            .that.contains.all.members(['1', '2', '3']);
          expect(lair.getOne('child', '1', { depth: 1 }))
            .to.have.property('parents')
            .that.contains.all.members(['1', '2', '3']);
          expect(lair.getOne('child', '2', { depth: 1 }))
            .to.have.property('parents')
            .that.contains.all.members(['1', '2', '3']);
          expect(lair.getOne('child', '3', { depth: 1 }))
            .to.have.property('parents')
            .that.contains.all.members(['1', '2', '3']);
        });

        it('many-to-many (custom related count)', () => {
          class ParentManyToManyFactory extends Factory {
            static factoryName = 'parent';
            @hasMany('child', 'parents')
            children;
          }
          class ChildManyToManyFactory extends Factory {
            static factoryName = 'child';
            @hasMany('parent', 'children')
            parents;
          }
          lair.registerFactory(ParentManyToManyFactory);
          lair.registerFactory(ChildManyToManyFactory);
          lair.createRecords('parent', 3);
          lair.createRecords('child', 10);
          lair.randomizeRelationsForExistingRecords('parent', 'child', {
            relatedCount: 4,
          });
          expect(lair.getOne('parent', '1', { depth: 1 }))
            .to.have.property('children')
            .that.has.length(4);
          expect(lair.getOne('parent', '2', { depth: 1 }))
            .to.have.property('children')
            .that.has.length(4);
          expect(lair.getOne('parent', '3', { depth: 1 }))
            .to.have.property('children')
            .that.has.length(4);
        });
      });

      describe('RU methods should return copies of records from the db', () => {
        let r;
        beforeEach(() => {
          class AFactory extends Factory {
            static factoryName = 'a';
            @field() propB = 'some';
          }
          lair.registerFactory(new AFactory());
          lair.createRecords('a', 1);
          r = lair.getOne('a', '1');
        });

        it('#getOne', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(lair.getOne('a', '1')).to.be.eql({ id: '1', propB: 'some' });
        });

        it('#getRandomOne', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(lair.getRandomOne('a')).to.be.eql({ id: '1', propB: 'some' });
        });

        it('#queryOne', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(lair.queryOne('a', (record) => record.id === '1')).to.be.eql({
            id: '1',
            propB: 'some',
          });
        });

        it('#queryRandomOne', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(
            lair.queryRandomOne('a', (record) => record.id === '1')
          ).to.be.eql({
            id: '1',
            propB: 'some',
          });
        });

        it('#getAll', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(lair.getAll('a')).to.be.eql([{ id: '1', propB: 'some' }]);
        });

        it('#queryMany', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(lair.queryMany('a', (record) => record.id === '1')).to.be.eql([
            { id: '1', propB: 'some' },
          ]);
        });

        it('queryRandomMany', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(
            lair.queryRandomMany('a', (record) => record.id === '1')
          ).to.be.eql([{ id: '1', propB: 'some' }]);
        });

        it('#updateOne', () => {
          expect(r).to.be.eql({ id: '1', propB: 'some' });
          delete r.id;
          expect(lair.updateOne('a', '1', { propB: 'another' })).to.be.eql({
            id: '1',
            propB: 'another',
          });
        });
      });
    });
  });
});
