import * as React from "react";

import { useLoaderData, useFetcher } from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { getList, type Item } from "~/models/lists.server";

type LoaderData = {
  items: Item[],
}

export const loader: LoaderFunction = async () => {
  const id = "testList";
  const items = await getList({id});
  return json<LoaderData>({items});
}

const DeleteButton = (props: React.ComponentProps<"div">) => {
  return (
    <div className="w-10 h-10 mr-2 bg-red-900 flex-none" {...props}/>
  )
}

const ItemRow = ({item}: {item: Item}) => {
  const fetcher = useFetcher();
  const handleDelete = () => {
    fetcher.submit({id: item.id}, {method: "post", action: "delete"});
  }
  const handleCheck = () => {
    fetcher.submit({id: item.id, currentState: `${item.completed}`}, {method: "post", action: "toggle"});
  }

  const bg = item.completed ? "bg-blue-800 " : "bg-blue-700 ";
  const submitting = fetcher.state == "idle" ? "" : "opacity-50 ";

  console.log(item)
  return (
    <li className={bg + submitting + "text-2xl h-16 border-black border flex items-center"}>
      <span className={"text-slate-300 flex-auto ml-2 " + (item.completed ? "text-slate-500 line-through" : "")} onClick={handleCheck}>{item.value}</span>
      <DeleteButton onClick={handleDelete}/>
    </li>
  )
}

const AddItem = () => {
  const fetcher = useFetcher();
  const [editing, setEditing] = React.useState<string | null>(null)

  const doAdd = () => {
    if (editing === null) {
      return;
    }
    fetcher.submit({item: editing}, {method: "post", action: "add"});
    setEditing("");
  }

  const handleClick = () => {
    if (editing === null) {
      setEditing("");
    }
  }
  const handleChange = (event: React.ChangeEvent) => {
    setEditing((event.target as HTMLInputElement).value)
  }
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
        case "Escape":
          setEditing(null);
        case "Enter":
          doAdd();
    }
  }
  const handleBlur = () => {
    doAdd();
    setEditing(null);
  }

  const placeholder = "Ajouter…";

  return (
    <li className="bg-blue-700 text-2xl h-16 border-black border flex items-center"
        onClick={handleClick}>
      {editing !== null
          ? <input
              autoFocus
              placeholder={placeholder}
              onBlur={handleBlur}
              value={editing}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mx-4 w-4/5 select-text"
            />
        : <span className="ml-4">{placeholder}</span>}
    </li>
  )
}

const ShoppingList = ({items}: {items: Item[]}) => {
  return (
    <ul className="flex flex-col place-items-stretch select-none">
      {items.map(item => <ItemRow key={item.id} item={item}/>)}
      <AddItem/>
    </ul>
  )
}

export default function MainPage() {
  const data = useLoaderData<LoaderData>();
  return (
    <ShoppingList items={data.items}/>
  )
}
