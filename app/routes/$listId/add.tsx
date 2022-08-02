import { type ActionFunction } from "@remix-run/node";
import { addItemAtEnd } from "~/models/lists.server";

export const action: ActionFunction = async ({ params, request }) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const item = payload.get("item");
	if (!item || typeof item !== "string") return null;

	await addItemAtEnd(listId, item);
	return null;
};
