import * as React from "react";
import {
    Link,
	useFetcher,
	useParams,
} from "@remix-run/react";
import {type FullList, type FullItem} from "~/models/lists.server";
import {useSocket} from "~/context";
import styled from "styled-components";
import Edit from "~/components/Edit";
import Delete from "~/components/Delete";

const COLORS: {
	[color: string]: {
		incomplete: string,
		completed: string,
		text: string,
		textCompleted: string,
		bg: string,
	}
} = {
	"white": {
		incomplete: "#FFF",
		completed: "#CCC",
		text: "rgb(100 116 139)",
		textCompleted: "rgb(100 116 139)",
		bg: "#AAA",
	},
	"red": {
		incomplete: "rgb(240, 100, 50)",
		completed: "#C00",
		text: "rgb(203 213 225)",
		textCompleted: "rgb(100 116 139)",
		bg: "#A00",
	},
	"green": {
		incomplete: "#0F0",
		completed: "#0C0",
		text: "rgb(100 116 139)",
		textCompleted: "rgb(203 213 225)",
		bg: "#0A0",
	},
	"blue": {
		incomplete: "#142136",
		completed: "#F9FAF7",
		text: "#F9FAF7",
		textCompleted: "#ABAFB1",
		bg: "#0000",
	},
}

const defaultColor = COLORS["white"];

const getColor = (color: string, completed: boolean) => {
	const colors = COLORS[color] || defaultColor;
	return completed ? colors.completed : colors.incomplete;
}

const getTextColor = (color: string, completed: boolean) => {
	const colors = COLORS[color] || defaultColor;
	return completed ? colors.textCompleted : colors.text;
}

const getBgColor = (color: string) => {
	const colors = COLORS[color] || defaultColor;
	return colors.bg;
}


const SDeleteSVG = styled.svg`
	height: 2.5rem;
	width: 2.5rem;
	flex: none;
	margin-right: 0.5rem;
	cursor: pointer;
`

const DeleteButton = ({item}: {item: FullItem}) => {
	const onUpdate = useBroadcastUpdate();
	const fetcher = useFetcher();
	const handleDelete = () => {
		fetcher.submit(
			{ id: item.id },
			{ method: "post", action: `${item.listId}/delete` }
		);
		onUpdate();
	};

	return <Delete onClick={handleDelete} $isCompleted={item.completed}/>
	// return (
	// 	<SDeleteSVG viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice" role="img" onPointerDown={handleDelete}>
	// 		<title>Supprimer cet élément</title>
	// 		<path d="M -70 -70 L 70 70 M -70 70 L 70 -70" strokeWidth="20" stroke="#C00" strokeLinecap="round"/>
	// 	</SDeleteSVG>
	// )
};

const EditButton = ({onClick, $isCompleted}: {onClick: () => void, $isCompleted: boolean}) => {
	return <Edit onClick={onClick} $isCompleted={$isCompleted}/>
};

const useBroadcastUpdate = () => {
	const params = useParams();
	const listId = params.listId as string;
	const socket = useSocket();
	return React.useCallback(() => {
		socket?.emit("update", listId)
	}, [socket, listId]);
}

const GREY = "#ABAFB1";

const SRow = styled.li<{$isCompleted?: boolean, $isWaiting?: boolean, $color: string, $isSubList?: boolean, $fontSize?: string}>`
	display: flex;
	min-height: 3.5rem;
	padding-left: 1rem;
	align-items: center;
	${props => (props.$isSubList && false) ? `border: 1px solid ${GREY};` : `border-top: 1px solid ${GREY}; border-bottom: 1px solid ${GREY};`}
	font-size: ${props => "1.5rem"};
	line-height: 2rem;
	${props => props.$isWaiting && "opacity: 0.5;"}
	background-color: ${props => getColor(props.$color, !!props.$isCompleted)}
`

const SItemText = styled.span<{$isCompleted?: boolean, $color: string}>`
	flex: 1 1 auto;
	color: ${props => getTextColor(props.$color, !!props.$isCompleted)};
	cursor: pointer;
	${props => props.$isCompleted && "text-decoration-line: line-through;"}
`;

const ItemRow = ({item, color}: {item: FullItem, color: string}) => {
	const onUpdate = useBroadcastUpdate();
	const fetcher = useFetcher();
	const handleCheck = () => {
		if (isEditing) return;
		console.log("Check!");
		onUpdate();
		fetcher.submit(
			{ id: item.id, currentState: `${item.completed}` },
			{ method: "post", action: `${item.listId}/toggle` }
		);
	};
	const value = item.value as string;

	const [isEditing, setIsEditing] = React.useState(false);
	const doSubmit = (newValue: string) => {
		setIsEditing(false);
		onUpdate();
		fetcher.submit(
			{id: item.id, newValue: newValue.trim()},
			{method: "post", action: `${item.listId}/edit`}
		);
	}

	const handleBlur = (event: React.FocusEvent) => {
		doSubmit((event.target as HTMLInputElement).value.trim());
		// setTimeout(() => {
		// }, 1000)
	}

	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key == "Enter") {
			 onUpdate();
			doSubmit((event.target as HTMLInputElement).value.trim());
		}
	}

	return (
		<SRow $isCompleted={item.completed} $isWaiting={fetcher.state !== "idle"} $color={color}>
			<SItemText onClick={handleCheck} $isCompleted={item.completed} $color={color}>
				{isEditing ? <SInput autoFocus enterKeyHint="done" defaultValue={value} onKeyUp={handleKeyUp} onBlur={handleBlur}/> : value}
			</SItemText>
			{item.completed ? <DeleteButton item={item}/> : <EditButton onClick={() => setIsEditing(true)} $isCompleted={item.completed}/>}
		</SRow>
	);
};

const SublistRow = ({item}: {item: FullItem}) => {
	const fetcher = useFetcher();
	const subList = item.childList as FullList;
	return (
		<Link to={`/${subList.id}`}>
			<SRow $isWaiting={fetcher.state !== "idle"} $color={subList.color} $isSubList>
				<SItemText $color={subList.color}>
					{subList.name}
				</SItemText>
			</SRow>
		</Link>
	)
}

const WHITE = "#F0F0F0";

const SInput = styled.input`
	margin-left: 0;
	margin-right: 1rem;
	width: 80%;
	user-select: text;
	color: rgb(0 0 0);
	height: 1.8rem;
	border-width: 1px;
	border-radius: 0.1rem;
	font-size: 0.66em;
	font-weight: inherit;
	&:focus::placeholder {
		color: #CCC;
	}
	&:focus {
		outline-offset: 1px;
		outline: 1.5px solid ${WHITE};
	}
	caret-color: ${GREY};
`

const AddItem = ({color}: {color: string}) => {
	const socket = useSocket();
	const params = useParams();
	const listId = params.listId as string;
	const fetcher = useFetcher();
	const [text, setText] = React.useState("");

	const [isSubList, setIsSubList] = React.useState(false);
	const handleIsSubListChange = (event: React.ChangeEvent) => {
		setIsSubList((event.target as HTMLInputElement).checked);
	}

	// const [scroll, setScroll] = React.useState(true);
	// const ref = React.useRef<HTMLInputElement | null>(null);
	// const entry = useIntersectionObserver(ref, {});
	// const isVisible = !!entry?.isIntersecting
	// React.useEffect(() => {
	// 	if (scroll && document.activeElement === ref.current) {
	// 		ref.current?.scrollIntoView();
	// 		setScroll(false);
	// 	}
	// }, [scroll, isVisible])

	const doAdd = () => {
		if (!text) return;
		socket?.emit("update", listId);
		fetcher.submit(
			{ item: text.trim(), isSubList: `${isSubList}` },
			{ method: "post", action: `${listId}/add` }
		);
		setText("");
	};

	const handleChange = (event: React.ChangeEvent) => {
		setText((event.target as HTMLInputElement).value);
	};
	const handleKeyDown = (event: React.KeyboardEvent) => {
		switch (event.key) {
			case "Enter":
				doAdd();
		}
	};

	const placeholder = isSubList ? "Ajouter une sous-liste…" : "Ajouter…";

	return (
		<SRow $color={color} $fontSize="1rem">
			<SInput
				type="text"
				enterKeyHint="done"
				placeholder={placeholder}
				value={text}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			/>
		</SRow>
	);
};
			// <input
			// 	type="checkbox"
			// 	checked={isSubList}
			// 	onChange={handleIsSubListChange}
			// />

const Row = ({item, color}: {item: FullItem, color: string}) => {
	return (item.childListId === null ? <ItemRow item={item} color={color}/> : <SublistRow item={item}/>)
}

const SMainList = styled.ul`
	display: flex;
	flex-direction: column;
	place-items: stretch;
	user-select: none;
	padding: 0;
	margin: 0;
	padding-bottom: 0.25rem;
`;

const SMain = styled.main<{$color: string}>`
	// background: ${props => getBgColor(props.$color)};
`;

const SHeader = styled.div`
	margin-top: 0;
	margin-bottom: 0;
	padding: 0.75rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #142136;
`

const SName = styled.span`
	margin: 0;
	margin-right: auto;
	font-size: 2.2rem;
	font-weight: bold;
`

const SBack = styled(Link)`
	display: flex;
	align-items: center;
	padding: 0.75rem 0 0 0.25rem;
	color: #142136;
	font-size: 1.3rem;
	line-height: 1.5rem;
`

const Header = ({list}: {list: FullList}) => {
	const fetcher = useFetcher();
	const handleColorChange = (event: React.ChangeEvent) => {
		fetcher.submit(
			{ color: (event.target as HTMLSelectElement).value.trim() },
			{ method: "post", action: `${list.id}/changeColor` }
		);
	};

	const [isEditing, setIsEditing] = React.useState(false);
	const doSubmit = (newValue: string) => {
		setIsEditing(false);
		fetcher.submit(
			{newValue: newValue.trim()},
			{method: "post", action: `${list.id}/rename`}
		);
	}

	const handleBlur = (event: React.FocusEvent) => {
		doSubmit((event.target as HTMLInputElement).value.trim());
	}

	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key == "Enter") {
			doSubmit((event.target as HTMLInputElement).value.trim());
		}
	}

	return (
		<SHeader>
 			<SName>
				{isEditing ? <SInput autoFocus enterKeyHint="done" defaultValue={list.name} onKeyUp={handleKeyUp} onBlur={handleBlur}/> : <span onClick={() => setIsEditing(true)}>{list.name}</span>}
			</SName>
		</SHeader>
	)
}
			// <select onChange={handleColorChange} value={list.color}>
			// 	{Object.keys(COLORS).map(color => (
			// 		<option key={color} value={color}>{color}</option>
			// 	))}
			// </select>
const BLUE = "#142136";

const SBackThing = styled.svg`
	height: 1.2rem;
	width: 1.5rem;
	flex: none;
	cursor: pointer;
	stroke: ${BLUE};
	fill: none;
	stroke-width: 14px;
	stroke-linecap: round;
	stroke-linejoin: round;
`

const BackThing = () => (
	<SBackThing viewBox="0 0 60 100">
		<path d="M 50 90 L 10 50 L 50 10"/>
	</SBackThing>
)

const SSubList = styled.svg`
	position: fixed;
	bottom: 1.5rem;
	right: 1rem;
	height: 3rem;
	width: 3rem;
	flex: none;
	cursor: pointer;
	stroke: none;
	fill: ${BLUE};
	path {
		stroke: ${WHITE};
		stroke-width: 10px;
		fill: none;
		stroke-linecap: round;
	}
`

const AddSubListSVG = (props) => (
	<SSubList viewBox="0 0 100 100" {...props}>
		<circle cx="50" cy="50" r="50"/>
		<path d="M 50 25 L 50 75 M 25 50 L 75 50"/>
	</SSubList>
)

const List = ({list}: {list: FullList}) => {
	const onUpdate = useBroadcastUpdate();
	const fetcher = useFetcher();
	const handleAddSubList = () => {
		onUpdate();
		fetcher.submit(
			{ item: "Nouvelle liste", isSubList: "true" },
			{ method: "post", action: `${list.id}/add` }
		);
	};

	return (
		<SMain $color={list.color}>
			{list.parent && <SBack to={`/${list.parent.listId}`}><BackThing/>Retour</SBack>}
			<Header list={list}/>
			<SMainList>
				{list.parent && <AddItem color={list.color}/>}
				{[...list.items].reverse().map((item) => (
					<Row key={item.id} item={item} color={list.color}/>
				))}
			</SMainList>
			{(!list.parent) && <AddSubListSVG onClick={handleAddSubList}/>}
		</SMain>
	);
};

export default List;
