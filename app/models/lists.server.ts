import type { ShoppingList, Item } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Item } from "@prisma/client";

export const getList = async ({id}: Pick<ShoppingList, "id">): Promise<Item[]> => {
  return await prisma.item.findMany({
    where: {shoppingListId: id},
    orderBy: {order: "asc"},
  })
}
