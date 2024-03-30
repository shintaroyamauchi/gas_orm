class SpreadsheetORM {
  constructor(sheetName, id = null) {
    this.sheetName = sheetName;
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = this.ss.getSheetByName(sheetName);
    this.ID = id;
  }

  save(record) {
    const { rows, headers, idIndex } = this._dataAccess();

    // recordを引数に取るように変更（継承できないので，子側のインスタンスを親側で取得できない）
    // const record = this.property_to_object();
    if (record.ID !== null) {
      this.update(record);
      return;
    }

    // 重複をチェック
    const duplicateId = this._find_id(record);
    if (duplicateId !== null) {
      console.log(`A duplicate row exists with ID: ${duplicateId}.`);
      return null;
    }

    record.ID = this.get_id();

    if (headers.length !== Object.keys(record).length) {
      console.log(
        "The number of columns does not match the number of properties."
      );
      return null;
    }

    const row = [];
    headers.forEach((header) => {
      row.push(record[header] || "");
    });
    this.sheet.appendRow(row);
    return record.ID;
  }

  findBy(key, value) {
    const { rows, headers, idIndex } = this._dataAccess();

    for (const row of rows) {
      const record = this._rowToObject(headers, row);
      if (record[key] === value) {
        this.ID = record.ID;
        return new SpreadsheetORM(this.sheetName, this.ID);
      }
    }
    return new SpreadsheetORM(this.sheetName); // 見つからなかった場合はnullを返す
  }

  findByHash(hash) {
    const { rows, headers, idIndex } = this._dataAccess();

    for (const row of rows) {
      const record = this._rowToObject(headers, row);
      let isMatch = true;
      for (const [key, value] of Object.entries(json)) {
        if (record[key] != value) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        this.ID = record.ID;
        return new SpreadsheetORM(this.sheetName, this.ID);
      }
    }
    return null; // 見つからなかった場合はnullを返す
  }

  findAllBy(key, value, limit = null) {
    const { rows, headers } = this._dataAccess();
    const matchingRecords = [];

    for (const row of rows) {
      if (limit !== null && matchingRecords.length >= limit) {
        break; // 指定された件数に達したらループを抜ける
      }

      const record = this._rowToObject(headers, row);
      if (record[key] === value) {
        matchingRecords.push(new SpreadsheetORM(this.sheetName, record.ID));
      }
    }
    const record_IDs = [];
    matchingRecords.forEach((record) => {
      record_IDs.push(record.ID);
    });

    return record_IDs; // 一致するレコードの配列を返す
  }

  _find_id(record) {
    const { rows, headers, idIndex } = this._dataAccess();

    const duplicateRow = rows.find((row) =>
      headers.every((header, index) => {
        // ID列を比較から除外
        if (index === idIndex) return true;
        // ID列以外で値を比較
        return row[index] === record[header];
      })
    );

    if (duplicateRow) {
      const duplicateId = duplicateRow[idIndex]; // 重複行のIDを取得
      return duplicateId; // 重複行のIDを返す
    } else {
      return null; // 重複行が見つからなかった場合はnullを返す
    }
  }

  find(record) {
    const { rows, headers, idIndex } = this._dataAccess();

    const duplicateRow = rows.find((row) =>
      headers.every((header, index) => {
        // ID列を比較から除外
        if (index === idIndex) return true;
        // ID列以外で値を比較
        return row[index] === record[header];
      })
    );

    if (duplicateRow) {
      const duplicateId = duplicateRow[idIndex]; // 重複行のIDを取得
      return new SpreadsheetORM(this.sheetName, duplicateId); // 重複行のIDを返す
    } else {
      return null; // 重複行が見つからなかった場合はnullを返す
    }
  }

  get_records() {
    const { rows, headers, idIndex } = this._dataAccess();
    for (const row of rows) {
      const record = this._rowToObject(headers, row);
      if (record.ID === this.ID) {
        return record;
      }
    }
    return null; // 見つからなかった場合はnullを返す
  }

  update(newData) {
    const { rows, headers, idIndex } = this._dataAccess();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[idIndex] == this.ID) {
        const startRow = i + 2; // 開始行（i行目のデータを指すため、i + 1を使用）
        const startColumn = 1; // 開始列（スプレッドシートの最初の列を指す）
        const numRows = 1; // 取得する行数（1行だけ取得する場合）
        const numColumns = headers.length; // 取得する列数（ヘッダーの数に等しい）
        const range = this.sheet.getRange(
          startRow,
          startColumn,
          numRows,
          numColumns
        );
        const firstRowOfRange = 0;
        const updatedRow = range.getValues()[firstRowOfRange];

        headers.forEach((header, index) => {
          if (newData.hasOwnProperty(header)) {
            updatedRow[index] = newData[header];
          }
        });

        range.setValues([updatedRow]);
        return; // 更新が完了したら終了
      }
    }

    throw new Error("Record not found with ID: " + this.ID);
  }

  delete() {
    const { rows, headers, idIndex } = this._dataAccess();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[idIndex] == this.ID) {
        this.sheet.deleteRow(i + 2);
        return; // 削除が完了したら終了
      }
    }

    throw new Error("Record not found with ID: " + this.ID);
  }

  get_all() {
    const { rows, headers, idIndex } = this._dataAccess();
    const records = [];
    for (const row of rows) {
      const record = this._rowToObject(headers, row);
      records.push(record);
    }
    return records;
  }

  _dataAccess() {
    const data = this.sheet.getDataRange().getValues();
    const header_index = 0;
    const headers = data[header_index];
    const idIndex = headers.indexOf("ID");
    if (idIndex == -1) {
      throw new Error("ID column not found");
    }
    const rows = data.slice(1);
    return { rows, headers, idIndex };
  }

  _rowToObject(headers, row) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  }

  get_id(id_name = "ID") {
    const data = this.ss
      .getSheetByName(this.sheetName)
      .getDataRange()
      .getValues();
    const header_index = 0;
    const headers = data[header_index];
    const idIndex = headers.indexOf(id_name);
    if (idIndex == -1) {
      throw new Error("ID column not found");
    }
    const rows = data.slice(1);
    const idValues = rows.map(function (row) {
      return row[idIndex];
    }); // 'ID'カラムのデータを抽出
    if (idValues.length == 0) {
      return 1; // データがない場合は1を返す
    }
    const maxId = Math.max.apply(null, idValues);
    const id = maxId + 1;
    return id;
  }

  property_to_object() {
    const obj = {};
    const keys = Object.keys(this);
    for (const key of keys) {
      obj[key] = this[key];
    }
    delete obj["sheetName"];
    delete obj["ss"];
    delete obj["sheet"];
    return obj;
  }
}

function TestSpreadsheetORMSave() {
  const orm = new SpreadsheetORM("Test");
  orm.Name = "Satoshi";
  orm.Age = 35;
  orm.save();
}

function TestSpreadsheetORMFindBy() {
  const orm = new SpreadsheetORM("Test");
  const found = orm.findBy("Name", "Alice");
  Logger.log(found);
}

function TestSpreadsheetORMFindAllBy() {
  const orm = new SpreadsheetORM("Test");
  const found = orm.findAllBy("Name", "Alice", 3);
  Logger.log(found);
}

function TestSpreadsheetORMFind() {
  const orm = new SpreadsheetORM("Test");
  const record = {
    Name: "Alice",
    Age: 25,
  };
  const found = orm.find(record);
  Logger.log(found);
}

function TestSpreadsheetORMGetRecords() {
  const orm = new SpreadsheetORM("Test");
  const record = orm.findBy("Name", "Alice").get_records();
  Logger.log(record);
}

function TestSpreadsheetORMUpdate() {
  const orm = new SpreadsheetORM("Test");
  orm.findBy("Name", "Alice").update({ Name: "Bob", Age: 25 });
  orm.findBy("Name", "Alice").update({ Age: 100 });
}

function TestSpreadsheetORMDelete() {
  const orm = new SpreadsheetORM("Test");
  orm.findBy("Name", "Bob").delete();
}

function TestSpreadsheetORMGetAll() {
  const orm = new SpreadsheetORM("Test");
  const records = orm.get_all();
  Logger.log(records);
}

// プライベートメソッドのテスト
function TestSpreadsheetORMRowToObject() {
  const orm = new SpreadsheetORM("Test");
  const headers = ["Name", "Age"];
  const row = ["Bob", 25];
  const obj = orm._rowToObject(headers, row);
  Logger.log(obj);
}

function TestSpreadsheetORMGetId() {
  const orm = new SpreadsheetORM("Test");
  const id = orm.get_id();
  Logger.log(id);
}

function TestSpreadsheetORMPropertyToObject() {
  const orm = new SpreadsheetORM("Test");
  orm.ID = 1;
  const obj = orm.property_to_object();
  Logger.log(obj);
}

function test_findByHash() {
  const orm = new SpreadsheetORM("Test");
  const found = orm.findByHash({ Name: "Alice", Age: 100 });
  Logger.log(found);
}
