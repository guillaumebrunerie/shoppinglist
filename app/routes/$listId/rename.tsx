import { type ActionArgs } from "@remix-run/node";
import { renameList } from "~/models/lists.server";

export const action = async ({params, request}: ActionArgs) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const name = payload.get("name");
	if (!name || typeof name !== "string") return null;

	await renameList(listId, name);
	return null;
};
