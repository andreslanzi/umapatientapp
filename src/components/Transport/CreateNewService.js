import React from 'react';
import { BsPlusCircleFill } from 'react-icons/bs'
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

const CreateNewService = () => {
	const history = useHistory();
	const { patient } = useSelector(state => state.queries);

	return (
		<div className="createNewService__container" onClick={() => history.push(`/${patient.ws}/createTransportRoute`)}>
			<div className="createNewService__icon">
				<BsPlusCircleFill />
			</div>
		</div>
	);
}

export default CreateNewService;