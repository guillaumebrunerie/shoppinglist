import { type ActionArgs } from "@remix-run/node";
import { editItem } from "~/models/lists.server";

export const action = async ({ request }: ActionArgs) => {
	const payload = await request.formData();
	const id = payload.get("id");
	if (!id || typeof id !== "string") return null;
	const value = payload.get("value");
	if (!value || typeof value !== "string") return null;

	await editItem(id, value);
	return null;
};
