import { redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { addList } from "~/models/lists.server";


export const action: ActionFunction = async () => {
    await addList("testList");
    return null;
}

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
