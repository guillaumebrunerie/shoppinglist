-- DropIndex
DROP INDEX "Item_order_key";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Liste de courses',
    "theme" TEXT NOT NULL DEFAULT 'default'
);
INSERT INTO "new_List" ("id") SELECT "id" FROM "List";
DROP TABLE "List";
ALTER TABLE "new_List" RENAME TO "List";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
