import * as React from "react";
import {DragDropContext, Draggable, Droppable, type DropResult} from "react-beautiful-dnd";
import {
	Link,
	useFetcher,
	useNavigate,
	useParams,
} from "@remix-run/react";
import {useBroadcastUpdate} from "~/socket";
import styled from "styled-components";
import Edit from "./Edit";
import Delete from "./Delete";
import Undo from "./Undo";

const DeleteButton = ({onClick, $isCompleted}: {onClick: () => void, $isCompleted: boolean}) => {
	return <Delete onClick={onClick} $isCompleted={$isCompleted}/>
};

const EditButton = ({onClick, $isCompleted}: {onClick: (event: React.MouseEvent) => void, $isCompleted: boolean}) => {
	return <Edit onClick={onClick} $isCompleted={$isCompleted}/>
};

const RestoreButton = ({onClick, $isCompleted}: {onClick: (event: React.MouseEvent) => void, $isCompleted: boolean}) => {
	return <Undo onClick={onClick} $isCompleted={$isCompleted}/>
};

const SRow = styled.li<{
	$isCompleted?: boolean,
	$isWaiting?: boolean,
	$isWaitingDelete?: boolean,
	$isSubList?: boolean,
	$fontSize?: string,
	$isDragging?: boolean,
}>`
	display: flex;
	filter: brightness(${props => props.$isDragging ? (props.$isCompleted ? "0.9" : "1.7") : "1"});
	min-height: ${props => props.$isWaitingDelete ? "0.2rem" : props.$isSubList ? "3.5rem" : "3rem"};
	transition: min-height 500ms cubic-bezier(0.22, 1, 0.36, 1);
	padding-left: ${props => props.$isSubList ? "1rem" : "0.8rem"};
	align-items: center;
	border-top: 1px solid var(--grey);
	border-bottom: 1px solid var(--grey);
	font-size: ${props => props.$isSubList ? "1.5rem" : "1.2rem"};
	line-height: 2rem;
	${props => props.$isWaiting && "opacity: 0.5;"}
	background-color: var(${props => (props.$isCompleted && !props.$isWaiting) ? "--background" : "--primary"});

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
`;

const SItemText = styled.span<{$isCompleted?: boolean, $isWaiting?: boolean}>`
	flex-shrink: 0;
	width: 100%;
	color: var(${props => props.$isCompleted || props.$isWaiting ? "--grey" : "--background"});
	cursor: pointer;
	${props => props.$isCompleted && "text-decoration-line: line-through;"}
`;

const SItemTextFlex = styled(SItemText)`
	flex-shrink: 1;
`

const Row = ({item, provided, isDragging, isWaitingReorder, isWaitingDelete}: {item: HalfItem, provided: any, isDragging: boolean, isWaitingReorder: boolean, isWaitingDelete: boolean}) => {
	const isSubList = !!item.childListId;

	const navigate = useNavigate();

	// Toggling checked state
	const [waitingCheck, doCheck] = useOptimisticAction(
		() => {
			if (isEditing) return null;
			if (isSubList) {
				navigate(`/${item.childList?.id}`)
				return null;
			}
			return {action: `${item.listId}/toggle`, id: item.id, currentState: `${completed}`};
		},
		item.listId,
	);
	let completed = !isSubList && item.completed;
	if (waitingCheck) {
		completed = waitingCheck.currentState === "false"
	}

	// Editing item
	const [isEditing, setIsEditing] = React.useState(false);
	const [waitingEdit, doEdit] = useOptimisticAction(
		(value: string) => {
			setIsEditing(false);
			if (!value || value === item.value) return null;
			if (isSubList) {
				return {action: `${item.childListId}/rename`, id: "", value};
			} else {
				return {action: `${item.listId}/edit`, id: item.id, value};
			}
		},
		item.listId,
	);
	let value = (isSubList ? item.childList?.name : item?.value) as string;
	if (waitingEdit) {
		value = waitingEdit.value as string;
	}
	const handleBlur = (event: React.FocusEvent) => {
		doEdit((event.target as HTMLInputElement).value.trim());
	}
	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key == "Enter") {
			doEdit((event.target as HTMLInputElement).value.trim());
		}
	}
	const handleEdit = (event: React.MouseEvent) => {
		setIsEditing(true);
		((event.target as Element).parentNode as Element)?.scrollTo(0, 0)
	}

	// Deleting item
	const [waitingDelete, doDelete] = useOptimisticAction(
		() => ({action: `${item.listId}/delete`, id: item.id}),
		item.listId,
	);

	if (isWaitingDelete || waitingDelete) {
		return (
			<SRow
				$isCompleted={completed}
				$isWaiting={!!waitingCheck || !!waitingEdit}
				$isWaitingDelete
			/>
		);
	}

	const displayedValue = value; //`${item.order}-${value}`;

	return (
		<SRow
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			$isCompleted={completed}
			$isWaiting={!!waitingCheck}
			$isWaitingDelete={!!waitingDelete}
			$isSubList={isSubList}
			$isDragging={isDragging || isWaitingReorder}
		>
			<SItemText onClick={doCheck} $isCompleted={completed} $isWaiting={!!waitingEdit}>
				{isEditing
						? <SInput autoFocus enterKeyHint="done" defaultValue={value} onKeyUp={handleKeyUp} onBlur={handleBlur}/>
					: displayedValue
				}
			</SItemText>
			<DeleteButton onClick={doDelete} $isCompleted={completed && !waitingCheck}/>
			<EditButton onClick={handleEdit} $isCompleted={completed && !waitingCheck}/>
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
	font-size: max(16px, 0.66em); // Needs to be at least 16px for iOS
	font-weight: inherit;
	&:focus::placeholder {
		color: var(--light-grey);
	}
	&:focus {
		outline-offset: 1px;
		outline: 1.5px solid var(--background);
	}
	caret-color: var(--grey);
`;

const AddItem = () => {
	const params = useParams();
	const listId = params.listId as string;
	const [text, setText] = React.useState("");

	const [waitingAdd, doAdd] = useOptimisticAction(
		(value: string) => {
			if (!value) return null;
			setText("");
			return {action: `${listId}/add`, value};
		},
		listId,
	);

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
			{waitingAdd && (
				<SRow $isWaiting>
					<SItemText>
						{waitingAdd.value as string}
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
	color: var(--primary);
`;

const SName = styled.span<{$isWaiting: boolean}>`
	margin: 0;
	margin-right: auto;
	font-size: 2.2rem;
	font-weight: bold;
	${props => props.$isWaiting && "opacity: 0.5;"}
`;

const SBack = styled.span`
	display: flex;
	align-items: center;
	padding: 0.75rem 0 0 0.25rem;
	color: var(--primary);
	font-size: 1.3rem;
	line-height: 1.5rem;
	cursor: pointer;
`;

const SMenuButton = styled.span`
	font-size: 30px;
	position: fixed;
	top: 5px;
	right: 10px;
	z-index: 1;
	cursor: pointer;
`

const SMenu = styled.div`
	width: 200px;
	background-color: var(--background);
	position: absolute;
	top: 40px;
	right: -5px;
	z-index: 1;
	border: 2px solid var(--primary);
	outline: 1px solid var(--background);
	border-radius: 15px;
	font-size: 1.1rem;
	line-height: 2rem;
	padding: 0.35rem 0.5rem;
`

const SBackdrop = styled.div`
	background-color: black;
	opacity: 30%;
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
`

const Header = ({list, doClean}: {list: HalfList, doClean: () => void}) => {
	const [waiting, doRename] = useOptimisticAction(
		(value: string) => {
			setIsEditing(false);
			if (!value || value === list.name) return null;
			return {action: `${list.id}/rename`, value};
		},
		list.id,
	)
	const name = waiting?.value as string ?? list.name;

	const [isEditing, setIsEditing] = React.useState(false);

	const handleBlur = (event: React.FocusEvent) => {
		doRename((event.target as HTMLInputElement).value.trim());
	}

	const handleKeyUp = (event: React.KeyboardEvent) => {
		if (event.key == "Enter") {
			doRename((event.target as HTMLInputElement).value.trim());
		}
	}

	const [isOpen, setIsOpen] = React.useState(false);
	const openMenu = () => {setIsOpen(true);}
	const closeMenu = () => {setIsOpen(false);}

	const handleClean = () => {
		closeMenu();
		doClean();
	}

	return (
		<SHeader>
			<SName $isWaiting={!!waiting}>
				{isEditing ? <SInput autoFocus enterKeyHint="done" defaultValue={name} onKeyUp={handleKeyUp} onBlur={handleBlur}/> : <span onClick={() => setIsEditing(true)}>{name}</span>}
			</SName>
			<SMenuButton>
				<span onClick={openMenu}>{"\u2807"}</span>
				{isOpen && (
					<SMenu>
						<span onClick={handleClean}>Nettoyer la liste</span>
						<br/>
						<Link to="/recentlyDeleted">Supprimés récemment</Link>
					</SMenu>
				)}
				{isOpen && <SBackdrop onClick={closeMenu}/>}
			</SMenuButton>
		</SHeader>
	);
};

const SBackThing = styled.svg`
	height: 1.2rem;
	width: 1.5rem;
	flex: none;
	cursor: pointer;
	stroke: var(--primary);
	fill: none;
	stroke-width: 14px;
	stroke-linecap: round;
	stroke-linejoin: round;
`;

const BackThing = () => (
	<SBackThing viewBox="0 0 60 100">
		<path d="M 50 90 L 10 50 L 50 10"/>
	</SBackThing>
);

const SSubList = styled.svg`
	position: fixed;
	bottom: 1.5rem;
	right: 1rem;
	height: 3rem;
	width: 3rem;
	flex: none;
	cursor: pointer;
	stroke: none;
	fill: var(--primary);
	path {
		stroke: var(--background);
		stroke-width: 10px;
		fill: none;
		stroke-linecap: round;
	}
`;

const SMain = styled.main<{$isLoading: boolean, $primaryColor?: string, $backgroundColor?: string}>`
	opacity: ${props => props.$isLoading ? "0.8" : "1"};
	transition: opacity ${props => props.$isLoading ? "0" : "100ms"} ease;

	${props => props.$primaryColor && `--primary: ${props.$primaryColor};`}
	${props => props.$backgroundColor && `--background: ${props.$backgroundColor};`}

	background-color: var(--background);
	height: 100vh;
`;

const AddSubListSVG = (props: {onClick: () => void}) => (
	<SSubList viewBox="0 0 100 100" {...props}>
		<circle cx="50" cy="50" r="50"/>
		<path d="M 50 25 L 50 75 M 25 50 L 75 50"/>
	</SSubList>
);

type HalfItem = {
	id: string,
	order: string,
	listId: string,
	completed: boolean,
	value?: string | null,
	childListId?: string | null,
	childList?: {
		id: string,
		name: string,
	} | null,
	deletedAt?: string | null,
};

export type HalfList = {
	id: string,
	name: string,
	parent: {listId: string} | null,
	items: HalfItem[],
};

const List = ({list, isLoading}: {list: HalfList, isLoading: boolean}) => {
	// TODO: optimistic ui
	const [_ /*isWaitingAddSubList*/, handleAddSubList] = useOptimisticAction(
		() => ({action: `${list.id}/add`, value: "Nouvelle liste", isSubList: "true"}),
		list.id,
	);

	const [waitingReorder, handleDragEnd] = useOptimisticAction(
		(result: DropResult) => {
			if (!result.destination || result.source.index === result.destination.index) return null;
			return {
				action: `${list.id}/reorder`,
				itemId: result.draggableId,
				sourceIndex: `${result.source.index}`,
				destinationIndex: `${result.destination.index}`,
			}
		},
		list.id,
	);
	if (waitingReorder) {
		list = JSON.parse(JSON.stringify(list));
		const [item] = list.items.splice(Number(waitingReorder.sourceIndex), 1);
		list.items.splice(Number(waitingReorder.destinationIndex), 0, item);
	}

	// const fetcherReorder = useFetcher();
	// const handleDragEnd = (result: DropResult) => {
	// 	if (!result.destination || result.source.index === result.destination.index) return;
	// 	onUpdate(list.id);
	// 	fetcherReorder.submit(
	// 		{ itemId: result.draggableId, sourceIndex: `${result.source.index}`, destinationIndex: `${result.destination.index}` },
	// 		{ method: "post", action: `${list.id}/reorder` }
	// 	);
	// }
	// const isWaiting = fetcherReorder.type == "actionSubmission" || fetcherReorder.type == "actionReload";
	// const waitingId = isWaiting && fetcherReorder.submission.formData.get("itemId") as string;
	// if (isWaiting) {
	// 	list = JSON.parse(JSON.stringify(list));
	// 	const [item] = list.items.splice(Number(fetcherReorder.submission.formData.get("sourceIndex")), 1);
	// 	list.items.splice(Number(fetcherReorder.submission.formData.get("destinationIndex")), 0, item);
	// }

	const completedIds = list.items.flatMap(item => item.completed ? [item.id] : []);
	const [waitingClean, doClean] = useOptimisticAction(
		() => ({action: `${list.id}/deleteMany`, ids: completedIds.join(",")}),
		list.id,
	);
	const waitingIds = waitingClean && (waitingClean.ids as string).split(",");

	const navigate = useNavigate();

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<SMain $isLoading={isLoading}>
				{list.parent && <SBack onClick={() => list.parent && navigate(`/${list.parent.listId}`)}><BackThing/>Retour</SBack>}
				<Header list={list} doClean={doClean}/>
				<Droppable droppableId={list.id}>
					{provided => (
						<SMainList ref={provided.innerRef} {...provided.droppableProps}>
							{list.parent && <AddItem/>}
							{list.items.map((item, i) => (
								<Draggable key={item.id} draggableId={item.id} index={i}>
									{(provided, snapshot) => (
										<Row
											provided={provided}
											isDragging={snapshot.isDragging}
											item={item}
											isWaitingReorder={!!waitingReorder && waitingReorder.itemId == item.id}
											isWaitingDelete={!!waitingIds && waitingIds.includes(item.id)}
										/>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</SMainList>
					)}
				</Droppable>
				{(!list.parent) && <AddSubListSVG onClick={handleAddSubList}/>}
			</SMain>
		</DragDropContext>
	);
};

export default List;

// Not perfect yet
const useOptimisticAction = <T extends unknown[]>(callback: (...args: T) => {action: string, [name: string]: string} | null, updateKey: string) => {
	const onUpdate = useBroadcastUpdate();
	const fetcher = useFetcher();
	const handle = (...args: T) => {
		const result = callback(...args)
		if (!result) return;
		const {action, ...props} = result;
		fetcher.submit(
			props,
			{method: "post", action},
		);
		onUpdate(updateKey);
	};
	const waiting = (fetcher.type == "actionSubmission" || fetcher.type == "actionReload") ? Object.fromEntries(fetcher.submission.formData) : null;

	return [waiting, handle] as const;
}

const RecentlyDeletedRow = ({item}: {item: HalfItem}) => {
	const isSubList = !!item.childListId;
	const displayedValue = isSubList ? item.childList?.name : item?.value as string;

	const [isWaitingRestore, handleRestore] = useOptimisticAction(
		() => ({action: "restore", id: item.id}),
		item.listId,
	)

	if (isWaitingRestore) {
		return (
			<SRow
				$isCompleted={item.completed}
				$isSubList={isSubList}
				$isWaitingDelete={!!isWaitingRestore}
			/>
		);
	}

	return (
		<SRow
			$isCompleted={item.completed}
			$isSubList={isSubList}
		>
			<SItemTextFlex $isCompleted={item.completed}>
				{displayedValue}
			</SItemTextFlex>
			<RestoreButton onClick={handleRestore} $isCompleted={item.completed}/>
		</SRow>
	)
};

const SDateHeader = styled.div`
	padding-left: 0.25rem;
	padding-top: 0.75rem;
	padding-bottom: 0.25rem;
	color: var(--primary);

	&:empty {
		display: none;
	}
`;

const getDateHeader = (from: HalfItem | undefined, to: HalfItem) => {
	if (!to.deletedAt) throw new Error("error");
	if (from && !from.deletedAt) throw new Error("error");
	const options = {day: "numeric", month: "long", hour: "numeric", minute: "numeric"} as const;
	const strTo = new Intl.DateTimeFormat("fr-FR", options).format(new Date(to.deletedAt));
	const strFrom = from && from.deletedAt ? new Intl.DateTimeFormat("fr-FR", options).format(new Date(from.deletedAt)) : "";
	return strTo === strFrom ? null : `(le ${strTo})`;
};

export const RecentlyDeletedList = ({items, isLoading}: {items: HalfItem[], isLoading: boolean}) => {
	const navigate = useNavigate();

	return (
		<SMain $isLoading={isLoading} $primaryColor="#444">
			<SBack onClick={() => navigate("/")}><BackThing/>Retour</SBack>
			<SHeader>
				<SName $isWaiting={false}>Supprimés récemment</SName>
			</SHeader>
			<SMainList>
				{items.map((item, i) => (
					<React.Fragment key={item.id}>
						<SDateHeader>
							{getDateHeader(items[i - 1], items[i])}
						</SDateHeader>
						<RecentlyDeletedRow item={item}/>
					</React.Fragment>
				))}
			</SMainList>
		</SMain>
	);
};
