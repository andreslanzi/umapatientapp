import React, { useState, useRef } from 'react';
import { TiPlus } from 'react-icons/ti';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import 'date-fns'


const CreateNewService = () => {
	const history = useHistory();
	const dispatch = useDispatch();
	const user = useSelector(state => state.user);
	const { date_filter } = useSelector(state => state.transport);
	const [datePickerOpen, setDatePickerOpen] = useState(false)
	const handlerPickerDate = (date) => {
		setDatePickerOpen(!datePickerOpen)
	}
	return (
		<div className={`createNewService__container ${user.corporate_norm === 'OSEP' && 'd-none'}`}>
			<div className="createNewService__icon " onClick={() => history.push(`/${user.ws}/createTransportRoute`)} >
				<TiPlus />
			</div>
			{/* <div className="createNewService__icon calendar" onClick={handlerPickerDate}>
				<BsCalendar />
			</div>
			<MuiPickersUtilsProvider utils={DateFnsUtils} >
				<DatePicker
					value={date_filter || new Date()}
					onChange={(e) => dispatch({ type: 'SET_DATE_FILTER', payload: e })}
					onClose={handlerPickerDate}
					open={datePickerOpen}
				/>
			</MuiPickersUtilsProvider> */}
		</div>
	);
}

export default CreateNewService;