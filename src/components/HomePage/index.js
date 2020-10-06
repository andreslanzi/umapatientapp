import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getMedicalRecord } from '../../store/actions/firebaseQueries';
import db from '../../config/DBConnection';
import ModulesMenu from './ModulesMenu';
import Loading from '../GeneralComponents/Loading';
import NotFound from '../GeneralComponents/NotFound';

const HomePage = (props) => {
	const dispatch = useDispatch();
	const checkStatus = useSelector((state) => state.front.checkStatus);
	const user = useSelector((state) => state.queries.patient);
	const mr = useSelector((state) => state.queries.medicalRecord);

	useEffect(() => {
		if (user && user.dni !== undefined) {
			dispatch(getMedicalRecord(user.dni, user.ws))
		}
	}, [dispatch, user])

	useEffect(() => {
		localStorage.setItem('userMr', JSON.stringify(mr));
	}, [mr])

	useEffect(() => {
		localStorage.setItem('userData', JSON.stringify(user));
	}, [user])

	useEffect(() => {
		async function checkCore(user) {
			try {
				var userId = db.auth().currentUser.uid;
				// Caso core_id y user_id coinciden
				if (user && user.core_id === userId) {
					//console.log("Valid CORE")
					dispatch({ type: 'SET_STATUS', payload: 99 });
					// caso core_id y user_id no coinciden PERO core_id existe
				} else if (user && user.core_id !== userId && user.core_id !== '' && user.core_id !== undefined) {
					setTimeout(() => {
						dispatch({ type: 'SET_STATUS', payload: 404 });
					}, 5000);
					// caso core_id no existe pero usuario sí
				} else if (user && user.fullname && user.core_id === undefined && user.fullname.length >= 4) {
					dispatch({ type: 'SET_STATUS', payload: 99 });
				} /*  (user === null || user.dni === "") */ else {
					dispatch({ type: 'SET_STATUS', payload: 99 });
				}
			} catch (err) {
				alert('[Error001] No se pudo verificar su cuenta:', user, err);
			}
		}
		checkCore(user);
	}, [dispatch, user]);

	if (!checkStatus) {
		return <Loading />;
	} else if (checkStatus === 404) {
		return <NotFound error='Usted no tiene permiso para ingresar a esta página' />;
	} else if (checkStatus === 99) {
		return <ModulesMenu ws={user.ws} />;
	} else {
		return 'Disculpe, la aplicación no es compatible con este dispositivo. Estamos trabajando en ello.';
	}
};

export default withRouter(HomePage);
