import { type ActionArgs } from "@remix-run/node";
import { reorderItem } from "~/models/lists.server";

export const action = async ({params, request}: ActionArgs) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const itemId = payload.get("itemId");
	if (!itemId || typeof itemId !== "string") throw new Error("wrong itemId");
	const destinationIndex = Number(payload.get("destinationIndex"));
	if (isNaN(destinationIndex)) throw new Error("wrong destinationIndex");
	const sourceIndex = Number(payload.get("sourceIndex"));
	if (isNaN(sourceIndex)) throw new Error("wrong sourceIndex");

	console.log("REORDER", listId, itemId, sourceIndex, destinationIndex);
	await reorderItem(listId, itemId, sourceIndex, destinationIndex);
	return null;
};
