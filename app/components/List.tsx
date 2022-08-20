import * as React from "react";
import {
	Link,
	useFetcher,
	useNavigate,
	useParams,
} from "@remix-run/react";
import {useSocket} from "~/context";
import styled from "styled-components";
import Edit from "~/components/Edit";
import Delete from "~/components/Delete";

const DeleteButton = ({onClick, $isCompleted}: {onClick: () => void, $isCompleted: boolean}) => {
	return <Delete onClick={onClick} $isCompleted={$isCompleted}/>
};

const EditButton = ({onClick, $isCompleted}: {onClick: () => void, $isCompleted: boolean}) => {
	return <Edit onClick={onClick} $isCompleted={$isCompleted}/>
};

const useBroadcastUpdate = () => {
	const params = useParams();
	const listId = params.listId as string;
	const socket = useSocket();
	return React.useCallback(() => {
		socket?.emit("update", listId);
	}, [socket, listId]);
}

const SRow = styled.li<{
	$isCompleted?: boolean,
	$isWaiting?: boolean,
	$isWaitingDelete?: boolean,
	$isSubList?: boolean,
	$fontSize?: string,
}>`
	display: flex;
	min-height: ${props => props.$isWaitingDelete ? "0.2rem" : props.$isSubList ? "3.5rem" : "3rem"};
	transition: min-height 500ms cubic-bezier(0.22, 1, 0.36, 1);
	padding-left: ${props => props.$isSubList ? "1rem" : "0.8rem"};
	align-items: center;
	border-top: 1px solid var(--grey);
	border-bottom: 1px solid var(--grey);
	font-size: ${props => props.$isSubList ? "1.5rem" : "1.2rem"};
	line-height: 2rem;
	${props => props.$isWaiting && "opacity: 0.5;"}
	background-color: var(--${props => (props.$isCompleted && !props.$isWaiting) ? "white" : "blue"});

	overflow: scroll;
	scroll-snap-type: x mandatory;
	&::-webkit-scrollbar {
		display: none;
	}
	& *:first-child, & *:last-child {
		scroll-snap-align: end;
	}
	& svg {
		border-left: 1px solid var(--grey);
		padding: 0 1rem;
		min-height: inherit;
	}
`

const SItemText = styled.span<{$isCompleted?: boolean, $isWaiting?: boolean}>`
	flex-shrink: 0;
	width: 100%;
	color: var(--${props => props.$isCompleted || props.$isWaiting ? "grey" : "white"});
	cursor: pointer;
	${props => props.$isCompleted && "text-decoration-line: line-through;"}
`;

const Row = ({item}: {item: HalfItem}) => {
	const onUpdate = useBroadcastUpdate();

	const isSubList = !!item.childListId;

	const navigate = useNavigate();

	// Toggling checked state
	const fetcherCheck = useFetcher();
	const handleCheck = () => {
		if (isEditing) return;
		if (isSubList) {
			navigate(`/${item.childList?.id}`)
			return;
		}
		fetcherCheck.submit(
			{ id: item.id, currentState: `${completed}` },
			{ method: "post", action: `${item.listId}/toggle` }
		);
		onUpdate();
	};
	let completed = !isSubList && item.completed;
	const isWaitingCheck = (fetcherCheck.type == "actionSubmission" || fetcherCheck.type === "actionReload");
	if (isWaitingCheck) {
		completed = fetcherCheck.submission.formData.get("currentState") === "false"
	}

	// Editing item
	const fetcherEdit = useFetcher();
	const doSubmit = (value: string) => {
		setIsEditing(false);
		if (!value || value === item.value) return;
		if (isSubList) {
			fetcherEdit.submit(
				{value},
				{method: "post", action: `${item.childListId}/rename`},
			);
		} else {
			fetcherEdit.submit(
				{id: item.id, value},
				{method: "post", action: `${item.listId}/edit`}
			);
		}
		onUpdate();
	}
	let value = (isSubList ? item.childList?.name : item?.value) as string;
	const isWaitingEdit = (fetcherEdit.type == "actionSubmission" || fetcherEdit.type === "actionReload");
	if (isWaitingEdit) {
		value = fetcherEdit.submission.formData.get("value") as string;
	}
	const [isEditing, setIsEditing] = React.useState(false);
	const handleBlur = (event: React.FocusEvent) => {
		doSubmit((event.target as HTMLInputElement).value.trim());
	}
	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key == "Enter") {
			doSubmit((event.target as HTMLInputElement).value.trim());
		}
	}

	// Deleting item
	const fetcherDelete = useFetcher();
	const handleDelete = () => {
		fetcherDelete.submit(
			{ id: item.id },
			{ method: "post", action: `${item.listId}/delete` }
		);
		onUpdate();
	};
	const isWaitingDelete = (fetcherDelete.type == "actionSubmission" || fetcherDelete.type === "actionReload");

	if (isWaitingDelete) {
		return (
			<SRow $isCompleted={completed} $isWaiting={isWaitingCheck || isWaitingEdit} $isWaitingDelete={isWaitingDelete}/>
		);
	}

	return (
		<SRow $isCompleted={completed} $isWaiting={isWaitingCheck} $isWaitingDelete={isWaitingDelete} $isSubList={isSubList}>
			<SItemText onClick={handleCheck} $isCompleted={completed} $isWaiting={isWaitingEdit}>
				{isEditing ? <SInput autoFocus enterKeyHint="done" defaultValue={value} onKeyUp={handleKeyUp} onBlur={handleBlur}/> : `${item.order}-${item.orderTmp}-${value}`}
			</SItemText>
			<DeleteButton onClick={handleDelete} $isCompleted={completed && !isWaitingCheck}/>
			<EditButton onClick={() => setIsEditing(true)} $isCompleted={completed && !isWaitingCheck}/>
		</SRow>
	);
};

const SInput = styled.input`
	margin-left: 0;
	margin-right: 1rem;
	width: 80%;
	user-select: text;
	color: rgb(0 0 0);
	height: 1.6rem;
	border-width: 1px;
	border-radius: 0.1rem;
	font-size: 0.66em;
	font-weight: inherit;
	&:focus::placeholder {
		color: var(--light-grey);
	}
	&:focus {
		outline-offset: 1px;
		outline: 1.5px solid var(--white);
	}
	caret-color: var(--grey);
`

const AddItem = () => {
	const onUpdate = useBroadcastUpdate();
	const params = useParams();
	const listId = params.listId as string;
	const fetcher = useFetcher();
	const [text, setText] = React.useState("");

	const doAdd = (value: string) => {
		if (!value) return;
		setText("");
		fetcher.submit(
			{ value },
			{ method: "post", action: `${listId}/add` }
		);
		onUpdate();
	};

	const handleChange = (event: React.ChangeEvent) => {
		setText((event.target as HTMLInputElement).value);
	};
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			doAdd(text.trim());
		}
	};

	return (
		<>
			<SRow $fontSize="1rem">
				<SInput
					type="text"
					enterKeyHint="done"
					placeholder="Ajouter…"
					value={text}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>
			</SRow>
			{(fetcher.type == "actionSubmission" || fetcher.type === "actionReload") && (
				<SRow $isWaiting>
					<SItemText>
						{fetcher.submission.formData.get("value") as string}
					</SItemText>
				</SRow>
			)}
		</>
	);
};

const SMainList = styled.ul`
	display: flex;
	flex-direction: column;
	place-items: stretch;
	user-select: none;
	padding: 0;
	margin: 0;
	padding-bottom: 0.25rem;
`;

const SHeader = styled.div`
	margin-top: 0;
	margin-bottom: 0;
	padding: 0.75rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: var(--blue);
`

const SName = styled.span<{$isWaiting: boolean}>`
	margin: 0;
	margin-right: auto;
	font-size: 2.2rem;
	font-weight: bold;
	${props => props.$isWaiting && "opacity: 0.5;"}
`

const SBack = styled.span`
	display: flex;
	align-items: center;
	padding: 0.75rem 0 0 0.25rem;
	color: var(--blue);
	font-size: 1.3rem;
	line-height: 1.5rem;
`

const Header = ({list}: {list: HalfList}) => {
	const onUpdate = useBroadcastUpdate();
	const fetcher = useFetcher();
	const doSubmit = (value: string) => {
		setIsEditing(false);
		if (!value || value === list.name) return;
		onUpdate();
		fetcher.submit(
			{value},
			{method: "post", action: `${list.id}/rename`}
		);
	}
	let name = list.name;
	const isWaiting = fetcher.type == "actionSubmission" || fetcher.type == "actionReload";
	if (isWaiting) {
		name = fetcher.submission.formData.get("value") as string;
	}
	const [isEditing, setIsEditing] = React.useState(false);

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
 			<SName $isWaiting={isWaiting}>
				{isEditing ? <SInput autoFocus enterKeyHint="done" defaultValue={name} onKeyUp={handleKeyUp} onBlur={handleBlur}/> : <span onClick={() => setIsEditing(true)}>{name}</span>}
			</SName>
		</SHeader>
	)
}

const SBackThing = styled.svg`
	height: 1.2rem;
	width: 1.5rem;
	flex: none;
	cursor: pointer;
	stroke: var(--blue);
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
	fill: var(--blue);
	path {
		stroke: var(--white);
		stroke-width: 10px;
		fill: none;
		stroke-linecap: round;
	}
`

const SMain = styled.main<{$isLoading: boolean}>`
	opacity: ${props => props.$isLoading ? "0.8" : "1"};
	transition: opacity ${props => props.$isLoading ? "0" : "100ms"} ease;
`

const AddSubListSVG = (props: {onClick: () => void}) => (
	<SSubList viewBox="0 0 100 100" {...props}>
		<circle cx="50" cy="50" r="50"/>
		<path d="M 50 25 L 50 75 M 25 50 L 75 50"/>
	</SSubList>
)

type HalfItem = {
	id: string,
	order: number,
	orderTmp: string,
	listId: string,
	completed: boolean,
	value?: string | null,
	childListId?: string | null,
	childList?: {
		id: string,
		name: string,
	} | null,
};

export type HalfList = {
	id: string,
	name: string,
	parent: {listId: string} | null,
	items: HalfItem[],
}

const List = ({list, isLoading}: {list: HalfList, isLoading: boolean}) => {
	const onUpdate = useBroadcastUpdate();
	const fetcher = useFetcher();
	const handleAddSubList = () => {
		onUpdate();
		fetcher.submit(
			{ value: "Nouvelle liste", isSubList: "true" },
			{ method: "post", action: `${list.id}/add` }
		);
	};

	const navigate = useNavigate();

	return (
		<SMain $isLoading={isLoading}>
			{list.parent && <SBack onClick={() => list.parent && navigate(`/${list.parent.listId}`)}><BackThing/>Retour</SBack>}
			<Header list={list}/>
			<SMainList>
				{list.parent && <AddItem/>}
				{[...list.items].reverse().map((item) => (
					<Row key={item.id} item={item}/>
				))}
			</SMainList>
			{(!list.parent) && <AddSubListSVG onClick={handleAddSubList}/>}
		</SMain>
	);
};

export default List;
