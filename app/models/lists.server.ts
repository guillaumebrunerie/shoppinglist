import {prisma} from "~/db.server";

import type {List, Item} from "@prisma/client";
export type {Item} from "@prisma/client";

type NamedItem = Item & {childList: List | null};
type ListWithNamedItems = List & {items: NamedItem[]};
export type FullItem = Item & {childList: ListWithNamedItems | null, list: ListWithNamedItems};
export type FullList = List & {items: FullItem[] , parent: FullItem | null};

export const getList = async (id: string): Promise<FullList | null> => {
	// Not sure if that’s how I’m supposed to do such requests...
	return await prisma.list.findUnique({
		where: { id },
		include: {
			items: {
				include: {
					childList: {
						include: {
							items: {
								include: {
									childList: true,
								}
							}
						}
					},
					list: {
						include: {
							items: {
								include: {
									childList: true,
								}
							}
						}
					},
				},
				orderBy: {
					order: "asc",
				},
			},
			parent: {
				include: {
					childList: {
						include: {
							items: {
								include: {
									childList: true,
								}
							}
						}
					},
					list: {
						include: {
							items: {
								include: {
									childList: true,
								}
							}
						}
					},
				},
			}
		},
	});
};

export const addList = async (id: string, name: string, color: string) => {
	await prisma.list.create({
		data: {
			id,
			name,
			color,
		},
	});
};

export const changeColor = async (id: string, color: string) => {
	await prisma.list.update({
		where: {
			id,
		},
		data: {
			color,
		},
	});
};

export const renameList = async (id: string, name: string) => {
	await prisma.list.update({
		where: {
			id,
		},
		data: {
			name,
		},
	});
};

export const getNextOrder = async (listId: string) => {
	const lastItem = await prisma.item.findFirst({
		where: { listId },
		orderBy: { order: "desc" },
	});
	return lastItem ? lastItem.order + 1 : 0;
}

export const addItem = async (listId: string, item: string) => {
	const order = await getNextOrder(listId);
	return await prisma.item.create({
		data: {
			order,
			value: item,
			listId,
		},
	});
};

export const addSubList = async (listId: string, name: string, color: string) => {
	const order = await getNextOrder(listId);
	const subList = await prisma.list.create({
		data: {
			name,
			color,
		},
	});
	return await prisma.item.create({
		data: {
			order,
			listId,
			childListId: subList.id,
		},
	});
};

export const deleteItem = async (id: string) => {
	await prisma.item.deleteMany({
		where: {
			id,
		},
	});
};

export const editItem = async (id: string, newValue: string) => {
	await prisma.item.update({
		where: {
			id,
		},
		data: {
			value: newValue,
		}
	});
};

export const setCompleted = async (id: string, completed: boolean) => {
	await prisma.item.update({
		where: {
			id,
		},
		data: {
			completed,
		},
	});
};
