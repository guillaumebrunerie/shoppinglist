import { type ActionArgs } from "@remix-run/node";
import { deleteItem } from "~/models/lists.server";

export const action = async ({ request }: ActionArgs) => {
	const payload = await request.formData();
	const id = payload.get("id");
	if (!id || typeof id !== "string") return;

	await deleteItem(id);
	return null;
};
