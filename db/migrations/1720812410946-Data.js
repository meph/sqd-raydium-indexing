module.exports = class Data1720812410946 {
    name = 'Data1720812410946'

    async up(db) {
        await db.query(`CREATE TABLE "jup_signatures" ("id" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, "bucket" integer NOT NULL, "processed" boolean NOT NULL DEFAULT false, "is_trade_extracted" boolean, "error_message" text, CONSTRAINT "PK_d8405dd5a5e381cc7deebdb6252" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "idx_bucket_processed_timestamp" ON "jup_signatures" ("bucket", "processed", "timestamp") `)
        await db.query(`CREATE INDEX "idx_processed_timestamp" ON "jup_signatures" ("processed", "timestamp") `)
        await db.query(`CREATE INDEX "idx_timestamp" ON "jup_signatures" ("timestamp") `)
        await db.query(`CREATE TABLE "sol_trades_source" ("id" character varying NOT NULL, "bucket" integer NOT NULL, "trader" character varying(50), "mint" character varying(50), "timestamp" TIMESTAMP, "token_delta" double precision, "sol_delta" double precision, "fee" bigint, "created_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e7f8890c964817baa8892912f94" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "idx_sol_trades_3" ON "sol_trades_source" ("mint") `)
        await db.query(`CREATE INDEX "idx_sol_trades_2" ON "sol_trades_source" ("timestamp") `)
        await db.query(`CREATE INDEX "idx_sol_trades_1" ON "sol_trades_source" ("mint", "timestamp") `)
        await db.query(`CREATE TABLE "token_trades" ("id" character varying NOT NULL, "signature" character varying(100) NOT NULL, "bucket" integer NOT NULL, "trader" character varying(50), "timestamp" TIMESTAMP, "mint_spent" character varying(50), "amount_spent" double precision, "mint_got" character varying(50), "amount_got" double precision, "fee" integer, CONSTRAINT "PK_a4a8440f4331dbff321ba4ade46" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "idx_token_trades_1" ON "token_trades" ("timestamp") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "jup_signatures"`)
        await db.query(`DROP INDEX "public"."idx_bucket_processed_timestamp"`)
        await db.query(`DROP INDEX "public"."idx_processed_timestamp"`)
        await db.query(`DROP INDEX "public"."idx_timestamp"`)
        await db.query(`DROP TABLE "sol_trades_source"`)
        await db.query(`DROP INDEX "public"."idx_sol_trades_3"`)
        await db.query(`DROP INDEX "public"."idx_sol_trades_2"`)
        await db.query(`DROP INDEX "public"."idx_sol_trades_1"`)
        await db.query(`DROP TABLE "token_trades"`)
        await db.query(`DROP INDEX "public"."idx_token_trades_1"`)
    }
}
