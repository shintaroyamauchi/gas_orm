# gas_orm

GAS 開発における，スプレッドシートを DB のように扱うための ORM

### スクリプト ID

1E_7usrH-IJaMSXcBtGWO8GJRSRh5IQNFsbgYXlMCLP7UuQjNzYRn_OAH

### 使用方法

```
# ラッパークラスを作成してください orm_rap.js

class SpreadsheetORMRap {
  constructor(sheetName, id = null) {
    this.orm = gas_orm.createSpreadSheetORM(sheetName, id);
    this.ID = null;
  }

  property_to_object() {
    const obj = {};
    const keys = Object.keys(this);
    for (const key of keys) {
      obj[key] = this[key];
    }
    delete obj["orm"];
    return obj;
  }

  save() {
    // もともとは親側で呼び出していたが，GASライブラリでは，継承ができないため
    const record = this.property_to_object();
    return this.orm.save(record);
  }

  findBy(key, value) {
    return this.orm.findBy(key, value);
  }

  findByHash(hash) {
    return this.orm.findByHash(hash);
  }

  findAllBy(key, value, limit = null) {
    return this.orm.findAllBy(key, value, limit);
  }

  find(record) {
    return this.orm.find(record);
  }

  get_records() {
    return this.orm.get_records();
  }

  update(newData) {
    return this.orm.update(newData);
  }

  delete() {
    return this.orm.delete();
  }

  get_all() {
    return this.orm.get_all();
  }

  get_id(id_name = "ID") {
    return this.orm.get_id(id_name);
  }
}

```
