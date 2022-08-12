import { type ActionFunction } from "@remix-run/node";
import { renameList } from "~/models/lists.server";

export const action: ActionFunction = async ({params, request}) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const newValue = payload.get("newValue");
	if (!newValue || typeof newValue !== "string") return null;

	await renameList(listId, newValue);
	return null;
};
