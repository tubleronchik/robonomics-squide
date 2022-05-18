module.exports = class Init1652868558267 {
  name = 'Init1652868558267'

  async up(db) {
    await db.query(`CREATE TABLE "datalog" ("id" character varying NOT NULL, "block_hash" text NOT NULL, "record" text NOT NULL, "block_moment" numeric NOT NULL, "account_id" character varying NOT NULL, CONSTRAINT "PK_bbff9d67f9f671c530a2765dc37" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_a631055ba17ac7b6f5a0d67b50" ON "datalog" ("account_id") `)
    await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
    await db.query(`ALTER TABLE "datalog" ADD CONSTRAINT "FK_a631055ba17ac7b6f5a0d67b50f" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "datalog"`)
    await db.query(`DROP INDEX "public"."IDX_a631055ba17ac7b6f5a0d67b50"`)
    await db.query(`DROP TABLE "account"`)
    await db.query(`ALTER TABLE "datalog" DROP CONSTRAINT "FK_a631055ba17ac7b6f5a0d67b50f"`)
  }
}
