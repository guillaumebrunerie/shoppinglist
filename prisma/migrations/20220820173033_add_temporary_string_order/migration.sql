-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "orderTmp" TEXT NOT NULL DEFAULT '',
    "value" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "childListId" TEXT,
    "listId" TEXT NOT NULL,
    CONSTRAINT "Item_childListId_fkey" FOREIGN KEY ("childListId") REFERENCES "List" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("childListId", "completed", "id", "listId", "order", "value") SELECT "childListId", "completed", "id", "listId", "order", "value" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_childListId_key" ON "Item"("childListId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
