class SpreadsheetORMRap {
  constructor(sheetName) {
    // GASライブラリとして読み込むときは，以下のコメントアウトを外す
    // this.parent = gas_orm.createSpreadSheetORM(sheetName, this);

    // 単体でテストするときは，以下のコメントアウトを外す
    this.parent = createSpreadSheetORM(sheetName, this);

    this.ID = null;
  }

  save() {
    return this.parent.save();
  }

  findBy(key, value) {
    return this.parent.findBy(key, value);
  }

  findByHash(hash) {
    return this.parent.findByHash(hash);
  }

  findAllBy(key, value, limit = null) {
    return this.parent.findAllBy(key, value, limit);
  }

  find(record) {
    return this.parent.find(record);
  }

  get_records() {
    return this.parent.get_records();
  }

  update(newData) {
    return this.parent.update(newData);
  }

  delete() {
    return this.parent.delete();
  }

  get_all() {
    return this.parent.get_all();
  }

  property_to_object() {
    return this.parent.property_to_object();
  }

  get_id(id_name = "ID") {
    return this.parent.get_id(id_name);
  }
}

function TestSpreadsheetORMRapAll() {
  TestSpreadsheetORMRapSave();
  TestSpreadsheetORMRapPropertyToObject();
  TestSpreadsheetORMRapFindBy();
  TestSpreadsheetORMRapFindByHash();
  TestSpreadsheetORMRapFindAllBy();
  TestSpreadsheetORMRapFind();
  TestSpreadsheetORMRapGetRecords();
  TestSpreadsheetORMRapUpdate();
  TestSpreadsheetORMRapGetAll();
  TestSpreadsheetORMRapGetId();
  TestSpreadsheetORMRapDelete();
}

function TestSpreadsheetORMRapSave() {
  console.log("Test SpreadsheetORMRap Save");
  const rap = new SpreadsheetORMRap("Test");
  rap.name = "Test";
  rap.age = 20;
  rap.save();
  rap.name = "Test";
  rap.age = 30;
  rap.save();
}

function TestSpreadsheetORMRapPropertyToObject() {
  console.log("Test SpreadsheetORMRap PropertyToObject");
  const rap = new SpreadsheetORMRap("Test");
  rap.name = "Test";
  rap.age = 20;
  const keys = rap.property_to_object();
  console.log(keys);
}

function TestSpreadsheetORMRapFindBy() {
  console.log("Test SpreadsheetORMRap FindBy");
  const rap = new SpreadsheetORMRap("Test");
  const found = rap.findBy("name", "Test");
  console.log("ID:", found.ID, "Expected: 1");
  console.log("Name:", found.name, "Expected: Test");
  console.log("Age:", found.age, "Expected: 20");
}

function TestSpreadsheetORMRapFindByHash() {
  console.log("Test SpreadsheetORMRap FindByHash");
  const rap = new SpreadsheetORMRap("Test");
  const hash = { name: "Test", age: 30 };
  const found = rap.findByHash(hash);
  console.log("ID:", found.ID, "Expected: 2");
  console.log("Name:", found.name, "Expected: Test");
  console.log("Age:", found.age, "Expected: 30");
}

function TestSpreadsheetORMRapFindAllBy() {
  console.log("Test SpreadsheetORMRap FindAllBy");
  const rap = new SpreadsheetORMRap("Test");
  const ids = rap.findAllBy("name", "Test");
  console.log("ids: " + ids, "Expected: 1, 2");
}

// こっちのほうが直感的？？
// function TestSpreadsheetORMRapFindAllBy() {
//   console.log("Test SpreadsheetORMRap FindAllBy");
//   const rap = new SpreadsheetORMRap("Test");
//   const founds = rap.findAllBy("name", "Test");
//   for (const found of founds) {
//     console.log(
//       "ID:",
//       found.ID,
//       "Expected: 1, 2",
//       "Name:",
//       found.name,
//       "Expected: Test",
//       "Age:",
//       found.age,
//       "Expected: 20, 30"
//     );
//   }
// }

// find関数はfindByHashと同じ関数？？
function TestSpreadsheetORMRapFind() {
  console.log("Test SpreadsheetORMRap Find");
  const rap = new SpreadsheetORMRap("Test");
  const record = {
    name: "Test",
    age: 30,
  };
  const found = rap.find(record);
  console.log("found id: ", found.ID, "Expected: 2");
}

function TestSpreadsheetORMRapGetRecords() {
  console.log("Test SpreadsheetORMRap GetRecords");
  const rap = new SpreadsheetORMRap("Test");
  const records = rap.findBy("name", "Test").get_records();
  console.log(
    "ID: " + records.ID,
    "Expected: 1",
    "Name: " + records.name,
    "Expected: Test",
    "Age: " + records.age,
    "Expected: 20"
  );
}

function TestSpreadsheetORMRapUpdate() {
  console.log("Test SpreadsheetORMRap Update");
  const rap = new SpreadsheetORMRap("Test");
  rap.findBy("name", "Test").update({ name: "Test2", age: 40 });
}

function TestSpreadsheetORMRapDelete() {
  console.log("Test SpreadsheetORMRap Delete");
  const rap = new SpreadsheetORMRap("Test");
  rap.findBy("name", "Test2").delete();
  rap.findBy("name", "Test").delete();
}

function TestSpreadsheetORMRapGetAll() {
  console.log("Test SpreadsheetORMRap GetAll");
  const rap = new SpreadsheetORMRap("Test");
  const records = rap.get_all();
  for (const record of records) {
    console.log(
      "ID: ",
      record.ID,
      "Expected: 1, 2",
      "Name: ",
      record.name,
      "Expected: Test2, Test",
      "Age: ",
      record.age,
      "Expected: 40, 30"
    );
  }
}

function TestSpreadsheetORMRapGetId() {
  console.log("Test SpreadsheetORMRap GetId");
  const rap = new SpreadsheetORMRap("Test");
  const id = rap.get_id();
  console.log("New id: ", id, "Expected: 3");
}
