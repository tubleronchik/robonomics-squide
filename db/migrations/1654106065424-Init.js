module.exports = class Init1654106065424 {
  name = 'Init1654106065424'

  async up(db) {
    await db.query(`CREATE TABLE "datalog" ("id" character varying NOT NULL, "block_hash" text NOT NULL, "record" text NOT NULL, "block_moment" numeric NOT NULL, "status" text NOT NULL, "account_id" character varying NOT NULL, CONSTRAINT "PK_bbff9d67f9f671c530a2765dc37" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_a631055ba17ac7b6f5a0d67b50" ON "datalog" ("account_id") `)
    await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "ipfs_data" ("id" character varying NOT NULL, "data" text NOT NULL, "datalog_id" character varying NOT NULL, CONSTRAINT "PK_2e8a7150fc4d7ceaf54dc00beb6" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_a45283e88391e0a1c30b13eba4" ON "ipfs_data" ("datalog_id") `)
    await db.query(`ALTER TABLE "datalog" ADD CONSTRAINT "FK_a631055ba17ac7b6f5a0d67b50f" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "ipfs_data" ADD CONSTRAINT "FK_a45283e88391e0a1c30b13eba42" FOREIGN KEY ("datalog_id") REFERENCES "datalog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "datalog"`)
    await db.query(`DROP INDEX "public"."IDX_a631055ba17ac7b6f5a0d67b50"`)
    await db.query(`DROP TABLE "account"`)
    await db.query(`DROP TABLE "ipfs_data"`)
    await db.query(`DROP INDEX "public"."IDX_a45283e88391e0a1c30b13eba4"`)
    await db.query(`ALTER TABLE "datalog" DROP CONSTRAINT "FK_a631055ba17ac7b6f5a0d67b50f"`)
    await db.query(`ALTER TABLE "ipfs_data" DROP CONSTRAINT "FK_a45283e88391e0a1c30b13eba42"`)
  }
}
