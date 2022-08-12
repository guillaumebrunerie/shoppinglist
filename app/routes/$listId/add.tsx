import { type ActionFunction } from "@remix-run/node";
import { addItem, addSubList } from "~/models/lists.server";

export const action: ActionFunction = async ({ params, request }) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const item = payload.get("item");
	if (!item || typeof item !== "string") return null;
	const isSubList = payload.get("isSubList") === "true";

	if (isSubList) {
		await addSubList(listId, item, "blue");
	} else {
		await addItem(listId, item);
	}
	return null;
};
