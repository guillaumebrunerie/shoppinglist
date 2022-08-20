import styled from "styled-components";

const SDeleteSVG = styled.svg<{$isCompleted: boolean}>`
	height: 1.5rem;
	width: 1.5rem;
	flex: none;
	cursor: pointer;
	stroke: var(--${props => props.$isCompleted ? "white" : "blue"});
	stroke-width: 10px;
	fill: var(--${props => props.$isCompleted ? "blue" : "white"});
`

const Delete = ({onClick, $isCompleted}: {onClick: (event: React.MouseEvent) => void, $isCompleted: boolean}) => {
	return (
		<SDeleteSVG $isCompleted={$isCompleted} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
			viewBox="0 0 490.584 490.584" onClick={onClick}>
			<g>
				<g>
					<path d="M100.911,419.404l123.8-51c3.1-2.1,6.2-4.2,8.3-6.2l203.9-248.6c6.2-9.4,5.2-21.8-3.1-29.1l-96.8-80.1
			c-8-5.9-20.3-6.8-28.1,3.1l-204.9,248.5c-2.1,3.1-3.1,6.2-4.2,9.4l-26,132.1C72.511,420.104,90.611,424.004,100.911,419.404z
			 M326.611,49.004l65.5,54.1l-177.7,217.1l-64.9-53.7L326.611,49.004z M133.411,306.904l44.4,36.8l-57.2,23.6L133.411,306.904z"/>
					<path d="M469.111,448.504h-349.5c0,0-72.5,3.4-75.2-15.2c0-1-1.8-5.6,7.6-17c7.3-9.4,6.2-21.8-2.1-29.1
			c-9.4-7.3-21.8-6.2-29.1,2.1c-19.8,23.9-25,44.7-15.6,63.5c25.5,47.5,111.3,36.3,115.4,37.3h348.5c11.4,0,20.8-9.4,20.8-20.8
			C490.011,457.804,480.611,448.504,469.111,448.504z"/>
				</g>
			</g>
		</SDeleteSVG>
	)
}

export default Delete;
