import { type ActionArgs } from "@remix-run/node";
import { setCompleted } from "~/models/lists.server";

export const action = async ({ request }: ActionArgs) => {
	const payload = await request.formData();
	const id = payload.get("id");
	if (!id || typeof id !== "string") return;
	const currentState = payload.get("currentState") === "true";

	await setCompleted(id, !currentState);
	return null;
};
