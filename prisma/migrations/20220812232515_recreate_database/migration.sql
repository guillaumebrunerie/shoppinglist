-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "value" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "childListId" TEXT,
    "listId" TEXT NOT NULL,
    CONSTRAINT "Item_childListId_fkey" FOREIGN KEY ("childListId") REFERENCES "List" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_childListId_key" ON "Item"("childListId");
