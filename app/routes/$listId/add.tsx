import { type ActionArgs } from "@remix-run/node";
import { addItem, addSubList } from "~/models/lists.server";

export const action = async ({ params, request }: ActionArgs) => {
	const listId = params.listId as string;
	const payload = await request.formData();
	const value = payload.get("value");
	if (!value || typeof value !== "string") return null;
	const isSubList = payload.get("isSubList") === "true";

	if (isSubList) {
		await addSubList(listId, value, "blue");
	} else {
		await addItem(listId, value);
	}
	return null;
};
