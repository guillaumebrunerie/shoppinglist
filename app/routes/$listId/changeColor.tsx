import { type ActionFunction } from "@remix-run/node";
import { changeColor } from "~/models/lists.server";

export const action: ActionFunction = async ({ params, request }) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const color = payload.get("color");
	if (!color || typeof color !== "string") return null;

	await changeColor(listId, color);
	return null;
};
