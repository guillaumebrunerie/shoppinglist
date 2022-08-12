import { type ActionFunction } from "@remix-run/node";
import { editItem } from "~/models/lists.server";

export const action: ActionFunction = async ({ request }) => {
	const payload = await request.formData();
	const id = payload.get("id");
	if (!id || typeof id !== "string") return null;
	const newValue = payload.get("newValue");
	if (!newValue || typeof newValue !== "string") return null;

	await editItem(id, newValue);
	return null;
};
