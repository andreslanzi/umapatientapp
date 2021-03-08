import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ForOther from './ForOther';
import { capitalizeName } from '../../Utils/stringUtils';
import BackButton from '../../GeneralComponents/Backbutton';
import moment from 'moment-timezone';
import { getUserParentsFirebase } from '../../../store/actions/firebaseQueries';
import enablePermissions from '../../Utils/enableVidAudPerms';
import ImageFlow from '../../../assets/online-doctor.png';
import Loading from '../../GeneralComponents/Loading';
import { findAllAssignedAppointment } from '../../Utils/appointmentsUtils';
import { getDocumentFB } from '../../Utils/firebaseUtils';
import 'moment/locale/es';
import '../../../styles/whoScreen.scss';

const WhenScreen = (props) => {
	const dispatch = useDispatch();
	const user = useSelector((state) => state.user);
	const currentUser = useSelector((state) => state.userActive.currentUser);
	const [registerParent, setRegisterParent] = useState(false);
	const [parents, setParents] = useState([]);
	const { loading } = useSelector((state) => state.front);
	const [userDataToJson] = useState(JSON.parse(localStorage.getItem('userData')));
	const [userDni] = useState(user.dni ? user.dni : userDataToJson.dni);
	const [redirectToConsultory] = useState(props.location.search.split('redirectConsultory=')[1]);


	useEffect(() => {
		let unmountTimeout = () => {}
		dispatch({ type: 'LOADING', payload: true });
		if(user.dni && user.dni !== "") {
			(async function checkAssignations() {
				dispatch({ type: 'LOADING', payload: true });
				localStorage.removeItem('selectedAppointment');
				await enablePermissions(userDni);
				if (redirectToConsultory !== 'true') {
					const type = moment().diff(user.dob, 'years') <= 16 ? 'pediatria' : '';
					const assigned = await findAllAssignedAppointment(userDni, type);
					dispatch({ type: 'LOADING', payload: false });
					if (assigned) {
						dispatch({ type: 'SET_ASSIGNED_APPOINTMENT', payload: assigned });
						return props.history.replace(`/onlinedoctor/queue/${userDni}`);
					}
				} else {
					unmountTimeout = setTimeout(dispatch({ type: 'LOADING', payload: false }), 5000)			
				}
			})()
		} else {
			unmountTimeout = setTimeout(() => dispatch({ type: 'LOADING', payload: false }), 5000)
		}
		return () => clearTimeout(unmountTimeout)
	}, [user, userDni]);

	useEffect(() => {
		if (user.dni) {
			getUserParentsFirebase(user.core_id)
				.then(function (userParents) {
					setParents(userParents);
				})
				.catch(() => setParents([]));
		}
	}, [user]);

	async function selectWho(userToDerivate, dependant) {
		localStorage.setItem('appointmentUserData', JSON.stringify(userToDerivate));
		await getCoverage(user.coverage)
		if (redirectToConsultory === 'true') {
			props.history.replace(`/appointmentsonline/${userToDerivate.dni}`);
		} else {
			let id = dependant ? userToDerivate.did: userToDerivate.uid 
			if(dependant){localStorage.setItem('uid_dependant', userToDerivate.did)}
			props.history.replace(`/onlinedoctor/when/${id}/${dependant}`);
		}
	}

	const getCoverage = async (coverage) => {
		// Busco BASIC primero porque es el básico sin ningun permiso
		let plan = await getDocumentFB('services/porfolio/BASIC/active')
		let free = await getDocumentFB('services/porfolio/FREE/active')
		if (plan && free) {
			plan["onlinedoctor"] = free.onlinedoctor
		}
		if (!!coverage && Array.isArray(coverage)) {
			coverage && await Promise.all(coverage.map(async each => {
				if (each?.plan) {
					let path = `services/porfolio/${each?.plan?.toUpperCase()}/active`
					let coverageTemp = await getDocumentFB(path)
					if (coverageTemp && coverageTemp.plan) {
						for (const service in coverageTemp.plan) {
							if (coverageTemp.plan[service] === true) {
								plan.plan[service] = true
							}
						}
					}
				}
			}))
		}
		dispatch({ type: 'SET_PLAN_DATA', payload: plan })
		return plan
	}

	return (
		<div className='dinamic-template'>
			<BackButton />
			{loading && <Loading centered={true} />}
			{registerParent ? (
				<ForOther redirectToConsultory={redirectToConsultory} />
			) : (
					<div className='dinamic-content-container whoAttention'>
						<div className='image-helper'>
							<img src={ImageFlow} alt='medical' />
						</div>
						<h2>¿Para quién es la consulta?</h2>
					</div>
				)}
			{!registerParent && (
				<div className='dinamic-answer'>
					<div className='btn btn-blue-lg' onClick={() => selectWho(currentUser, false)} id="att_especislista_select_me">
						Para mi
					</div>
					{parents.map((p, index) => (
						<div className='btn btn-blue-lg' key={index} onClick={() => selectWho(p, true)} id="att_especislista_select_other">
							Para {capitalizeName(p.fullname)}
						</div>
					))}
					<div className='btn btn-blue-lg' onClick={() => setRegisterParent(true)} id="att_register_me">
						Para otro
					</div>
				</div>
			)}
		</div>
	);
};

export default withRouter(WhenScreen);
