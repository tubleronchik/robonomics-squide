module.exports = class Init1649425435983 {
  name = 'Init1649425435983'

  async up(db) {
    await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "address" text NOT NULL, "moment" numeric NOT NULL, "datalog" jsonb NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
  }

  async down(db) {
    await db.query(`DROP TABLE "account"`)
  }
}
