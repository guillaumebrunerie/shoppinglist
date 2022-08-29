import { type ActionArgs } from "@remix-run/node";
import { deleteItem } from "~/models/lists.server";

export const action = async ({ request }: ActionArgs) => {
	const payload = await request.formData();
	const ids = payload.get("ids");
	if (!ids || typeof ids !== "string") return;

	for (const id of ids.split(",")) {
		await deleteItem(id);
	}
	return null;
};
