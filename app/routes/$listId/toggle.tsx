import { type ActionFunction } from "@remix-run/node";
import { toggleItem } from "~/models/lists.server";

export const action: ActionFunction = async ({ request }) => {
	const payload = await request.formData();
	const id = payload.get("id");
	if (!id || typeof id !== "string") return;
	const currentState = payload.get("currentState") === "true";

	await toggleItem(id, currentState);
	return null;
};
