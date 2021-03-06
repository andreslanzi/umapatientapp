
import React, { useState, useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import TrasladosWelcome from './TrasladosWelcome';
import RegisterForm from './RegisterForm'
import '../../styles/generalcomponents/TransportMain.scss';


const TransportWrapperComponent = (props) => {
    const dispatch = useDispatch();
    const [welcome, setWelcome] = useState(true)
	const stepPosition = useSelector((state) => state.front.paginationTransport);
	
	useEffect(() =>{
		window.gtag('event', 'select_content', {content_type: "TRANSPORT_REGISTER", item: ['TRANSPORT_REGISTER']})
	},[])

    function showStep() {
        return (
					<div className="stepsContainer d-flex justify-content-center">
						<div style={{cursor:'pointer'}} onClick={() => dispatch({type: 'SET_PAGINATION_TRANSPORT', payload: 1})} 
						className={stepPosition === 1 ? "secondStep active" : "secondStep" }>1</div>
						<div style={{cursor:'pointer'}} onClick={() => dispatch({type: 'SET_PAGINATION_TRANSPORT', payload: 2})} 
						className={stepPosition === 2 ? "thirdStep active" : "thirdStep" }>2</div>
					</div>
        );
    }        

	// function goToStepForm() {
	// 	if (stepPosition === 1) {
	// 		return <SecondStep />;
	// 	} else if (stepPosition === 2) {
	// 		return <ThirdStep props={props.props} />;
	// 	}
	// }

	return (
		<>
			{welcome ?
				<TrasladosWelcome startTraslados={() => setWelcome(false)} />
				:
				<RegisterForm />
			}
		</>
	);
}

export default TransportWrapperComponent;
