import {prisma} from "~/db.server";

import type {List, Item} from "@prisma/client";
import { midString } from "./utils.server";
export type {Item} from "@prisma/client";

type NamedItem = Item & {childList: List | null};
type ListWithNamedItems = List & {items: NamedItem[]};
export type FullItem = Item & {childList: ListWithNamedItems | null, list: ListWithNamedItems};
export type FullList = List & {items: FullItem[] , parent: FullItem | null};

export const getList = async (id: string): Promise<FullList | null> => {
	const includeItems = {
		include: {
			items: {
				where: {
					deletedAt: null,
				},
				include: {
					childList: true,
				},
				orderBy: {
					order: "asc" as const,
				},
			},
		},
	};

	const includeLists = {
		include: {
			childList: includeItems,
			list: includeItems,
		},
	};

	return await prisma.list.findUnique({
		where: {
			id,
		},
		include: {
			items: {
				where: {
					deletedAt: null,
				},
				orderBy: {
					order: "asc",
				},
				...includeLists,
			},
			parent: includeLists,
		},
	});
};

export const getDeletedItems = async () => {
	return await prisma.item.findMany({
		where: {
			deletedAt: {not: null},
		},
		orderBy: {
			deletedAt: "desc",
		},
		include: {
			childList: true,
		},
	})
};

export const restoreItem = async (id: string) => {
	// TODO: the order may be already used, how to make sure it won’t be
	// duplicated without adding a lot of complexity?
	await prisma.item.update({where: {id}, data: {deletedAt: null}});
};

export const addList = async (id: string, name: string, color: string) => {
	await prisma.list.create({data: {id, name, color}});
};

export const changeColor = async (id: string, color: string) => {
	await prisma.list.update({where: {id}, data: {color}});
};

export const renameList = async (id: string, name: string) => {
	await prisma.list.update({where: {id}, data: {name}});
};

export const getOrderFirst = async (listId: string) => {
	const firstItem = await prisma.item.findFirst({
		where: {listId, deletedAt: null},
		orderBy: {order: "asc"},
	});

	const a = "";
	const b = firstItem?.order || "";
	const c = midString(a, b);
	console.log("----------", a, b, c);

	return midString("", firstItem?.order || "");
};

export const getOrderLast = async (listId: string) => {
	const lastItem = await prisma.item.findFirst({
		where: {listId, deletedAt: null},
		orderBy: {order: "desc"},
	});

	return midString(lastItem?.order || "", "");
};

// TODO: Fix race conditions
export const addItem = async (listId: string, item: string) => {
	const order = await getOrderFirst(listId);
	return await prisma.item.create({data: {order, value: item, listId}});
};

// TODO: Fix race conditions
export const addSubList = async (listId: string, name: string, color: string) => {
	const order = await getOrderLast(listId);
	const subList = await prisma.list.create({data: {name, color}});
	return await prisma.item.create({data: {order, listId, childListId: subList.id}});
};

// Soft delete (TODO: hard delete items older than 30 days?)
export const deleteItem = async (id: string) => {
	await prisma.item.update({where: {id}, data: {deletedAt: new Date()}})
};

export const editItem = async (id: string, value: string) => {
	await prisma.item.update({where: {id}, data: {value}});
};

export const setCompleted = async (id: string, completed: boolean) => {
	await prisma.item.update({where: {id}, data: {completed}});
};

// TODO: Fix race conditions
export const reorderItem = async (listId: string, id: string, sourceIndex: number, destinationIndex: number) => {
	const items = await prisma.item.findMany({
		where: {
			listId,
			deletedAt: null,
		},
		orderBy: { order: "asc" },
		select: {
			id: true,
			order: true,
		},
	});
	const [source] = items.splice(sourceIndex, 1);
	if (source.id !== id || destinationIndex > items.length) {
		console.error("Error", source.id, id, destinationIndex, items.length);
		return;
	}
	const prev = destinationIndex == 0 ? "" : items[destinationIndex - 1].order;
	const next = destinationIndex == items.length ? "" : items[destinationIndex].order;
	const order = midString(prev, next);

	await prisma.item.update({where: {id}, data: {order}});
};
