import {prisma} from "~/db.server";

import type {List, Item} from "@prisma/client";
import { midString } from "./utils.server";
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
								},
								orderBy: {
									order: "asc",
								},
							}
						}
					},
					list: {
						include: {
							items: {
								include: {
									childList: true,
								},
								orderBy: {
									order: "asc",
								},
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
								},
								orderBy: {
									order: "asc",
								},
							}
						}
					},
					list: {
						include: {
							items: {
								include: {
									childList: true,
								},
								orderBy: {
									order: "asc",
								},
							},
						},
					},
				},
			},
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

export const getOrderFirst = async (listId: string) => {
	const firstItem = await prisma.item.findFirst({
		where: { listId },
		orderBy: { order: "asc" },
	});

	return midString("", firstItem?.order || "");
};

export const getOrderLast = async (listId: string) => {
	const lastItem = await prisma.item.findFirst({
		where: { listId },
		orderBy: { order: "desc" },
	});

	return midString(lastItem?.order || "", "");
};

export const addItem = async (listId: string, item: string) => {
	const order = await getOrderFirst(listId);
	return await prisma.item.create({
		data: {
			order,
			value: item,
			listId,
		},
	});
};

export const addSubList = async (listId: string, name: string, color: string) => {
	const order = await getOrderLast(listId);
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

// export const updateDatabase = async () => {
// 	const items = await prisma.item.findMany();
// 	items.forEach(async item => {
// 		const newOrder = String.fromCharCode(98 + item.order);
// 		await prisma.item.update({
// 			where: {
// 				id: item.id,
// 			},
// 			data: {
// 				orderTmp: newOrder,
// 			}
// 		})
// 	})
// }

export const reorderItem = async (listId: string, itemId: string, sourceIndex: number, destinationIndex: number) => {
	const items = await prisma.item.findMany({
		where: {
			listId,
		},
		orderBy: { order: "asc" },
		select: {
			id: true,
			order: true,
		},
	});
	const [source] = items.splice(sourceIndex, 1);
	if (source.id !== itemId || destinationIndex > items.length) {
		console.error("Error", source.id, itemId, destinationIndex, items.length);
		return;
	}
	const prev = destinationIndex == 0 ? "" : items[destinationIndex - 1].order;
	const next = destinationIndex == items.length ? "" : items[destinationIndex].order;
	const newOrder = midString(prev, next);

	await prisma.item.update({
		where: {
			id: itemId,
		},
		data: {
			order: newOrder,
		}
	});
};
