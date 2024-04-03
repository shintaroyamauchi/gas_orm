class SpreadsheetORM {
  constructor(sheetName, child) {
    this.sheetName = sheetName;
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = this.ss.getSheetByName(sheetName);
    this.child = child;
  }

  save() {
    const { rows, headers, idIndex } = this._dataAccess();

    const record = this.property_to_object();
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

    // varbose
    // console.log("headers: ", headers);
    // console.log("keys: ", Object.keys(record));

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
        // this.childのプロパティにrecordの同名のプロパティをコピー
        for (const key of Object.keys(record)) {
          this.child[key] = record[key];
        }
        return this.child;
      }
    }
    return null; // 見つからなかった場合はnullを返す
  }

  findByHash(hash) {
    const { rows, headers, idIndex } = this._dataAccess();

    for (const row of rows) {
      const record = this._rowToObject(headers, row);
      let isMatch = true;
      for (const [key, value] of Object.entries(hash)) {
        if (record[key] != value) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        for (const key of Object.keys(record)) {
          this.child[key] = record[key];
        }
        return this.child;
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
        for (const key of Object.keys(record)) {
          this.child[key] = record[key];
        }
        let copy = { ...this.child }; // オブジェクトのコピーを作成
        matchingRecords.push(copy);
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
        if (index == idIndex) return true;
        // ID列以外で値を比較
        return row[index] == record[header];
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
      for (const key of Object.keys(duplicateRow)) {
        this.child[key] = duplicateRow[key];
      }
      return this.child; // 重複行のIDを返す
    } else {
      return null; // 重複行が見つからなかった場合はnullを返す
    }
  }

  // findの中で，recordをコピーしているので不要？？
  get_records() {
    const { rows, headers, idIndex } = this._dataAccess();
    for (const row of rows) {
      const record = this._rowToObject(headers, row);
      if (record.ID === this.child.ID) {
        return record;
      }
    }
    return null; // 見つからなかった場合はnullを返す
  }

  update(newData) {
    const { rows, headers, idIndex } = this._dataAccess();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[idIndex] == this.child.ID) {
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

    throw new Error("Record not found with ID: " + this.child.ID);
  }

  delete() {
    const { rows, headers, idIndex } = this._dataAccess();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[idIndex] == this.child.ID) {
        this.sheet.deleteRow(i + 2);
        return; // 削除が完了したら終了
      }
    }

    throw new Error("Record not found with ID: " + this.child.ID);
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
    const keys = Object.keys(this.child);
    for (const key of keys) {
      obj[key] = this.child[key];
    }
    delete obj["parent"];
    return obj;
  }
}
