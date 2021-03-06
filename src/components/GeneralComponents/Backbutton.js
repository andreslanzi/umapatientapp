import React from 'react'
import { Link } from 'react-router-dom';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import "../../styles/global/Backbutton.scss";

export default (props) => (
	<section className={props.inlineButton ? "backButtonContainer inlineButton" : "backButtonContainer"}>
		<Link to={props.customTarget ? props.customTarget : '/'}>
			<FontAwesomeIcon icon={faChevronLeft} />
		</Link>
	</section>
);
