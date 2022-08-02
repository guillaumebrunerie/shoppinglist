import type { Item } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Item } from "@prisma/client";

export const getList = async (id: string): Promise<Item[] | null> => {
	const list = await prisma.list.findUnique({
		where: { id },
		include: {
			items: {
				orderBy: { order: "asc" },
			},
		},
	});

	if (!list) return null;
	return list.items;
};

export const addList = async (id: string) => {
	await prisma.list.create({
		data: {
			id,
		},
	});
};

export const addItemAtEnd = async (listId: string, item: string) => {
	const lastItem = await prisma.item.findFirst({
		where: { listId },
		orderBy: { order: "desc" },
	});
	console.log(lastItem);
	const order = lastItem ? lastItem.order + 1 : 0;
	await prisma.item.create({
		data: {
			value: item,
			order,
			listId,
		},
	});
	return;
};

export const deleteItem = async (id: string) => {
	await prisma.item.delete({
		where: {
			id,
		},
	});
};

export const toggleItem = async (id: string, currentState: boolean) => {
	console.log("toggle");
	await prisma.item.update({
		where: {
			id,
		},
		data: {
			completed: !currentState,
		},
	});
};
