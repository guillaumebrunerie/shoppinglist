import { type ActionArgs } from "@remix-run/node";
import { restoreItem } from "~/models/lists.server";

export const action = async ({ request }: ActionArgs) => {
	const payload = await request.formData();
	const id = payload.get("id");
	if (!id || typeof id !== "string") return;

	await restoreItem(id);
	return null;
};
