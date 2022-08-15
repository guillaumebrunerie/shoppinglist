import { type ActionArgs } from "@remix-run/node";
import { renameList } from "~/models/lists.server";

export const action = async ({params, request}: ActionArgs) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const value = payload.get("value");
	if (!value || typeof value !== "string") return null;

	await renameList(listId, value);
	return null;
};
