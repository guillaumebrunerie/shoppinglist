import { type ActionFunction } from "@remix-run/node";
import { deleteItem } from "~/models/lists.server";

export const action: ActionFunction = async ({ request }) => {
	const payload = await request.formData();
	const id = payload.get("id");
	if (!id || typeof id !== "string") return;

	await deleteItem(id);
	return null;
};
