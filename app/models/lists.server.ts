import type { List, Item } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Item } from "@prisma/client";

export const getList = async ({id}: {id: string}): Promise<Item[]> => {
  return await prisma.item.findMany({
    where: {listId: id},
    orderBy: {order: "asc"},
  })
}

export const addItemAtEnd = async (id: string, item: string) => {
  const lastItem = await prisma.item.findFirst({
      where: {listId: id},
      orderBy: {order: "desc"}
  });
    console.log(lastItem);
  const order = lastItem ? lastItem.order + 1 : 0
  await prisma.item.create({
      data: {
          value: item,
          order,
          listId: id,
      }
  })
  return;
}

export const deleteItem = async (id: string) => {
    await prisma.item.delete({
        where: {
            id,
        }
    })
}

export const toggleItem = async (id: string, currentState: boolean) => {
    await prisma.item.update({
        where: {
            id,
        },
        data: {
            completed: !currentState,
        }
    })
}
