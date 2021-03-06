import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUpload } from 'react-icons/fi';
import { checkNum } from '../Utils/stringUtils';
import { Loader } from '../global/Spinner/Loaders';
import { EditButton } from './EditComponent';
import { uploadFileToFirebase } from '../Utils/postBlobFirebase';
import { node_patient } from '../../config/endpoints';
import { GenericInputs } from '../User/Login/GenericComponents';
import moment from 'moment-timezone';
import axios from 'axios';

export const ProfilePic = ({ user }) => {
	const dispatch = useDispatch();
	const [userData, setUserData] = useState({ profile_pic: user.profile_pic || '' });
	const [loader, setLoader] = useState(false)
	const [showError, setShowError] = useState(false)
    const { currentUser } = useSelector((state) => state.userActive)

	const handleSubmit = async (e, userData, user) => {
		setLoader(true)
		let data = {
			newValues: { ...userData },
			uid: currentUser.uid
		};
		await currentUser.getIdToken().then(async token => {
			let headers = { 'Content-Type': 'Application/Json', 'Authorization': `Bearer ${token}` }
			if(currentUser.uid === user.id) {
				await axios.patch(`${node_patient}/update/${currentUser.uid}`, data, {headers})
				.then((res) => {
					setLoader(false)
					dispatch({ type: 'TOGGLE_DETAIL' });
					dispatch({ type: 'GET_PATIENT', payload: data.newValues});
				})
				.catch((err) => {
					dispatch({ type: 'TOGGLE_DETAIL' });
					console.log(err);
				});
			}else {
				await axios.patch(`${node_patient}/updateDependant/${user.id}`, data, {headers})
				.then((res) => {
					setLoader(false)
					dispatch({ type: 'TOGGLE_DETAIL' });
				})
				.catch((err) => {
					dispatch({ type: 'TOGGLE_DETAIL' });
					console.log(err);
				});
			}
		})
	};

	const uploadImage = (e) => {
		setShowError(false)
		let dt = moment().format('YYYYMMDDHHmmss');
		let fieldName = e.target.name;
		let file = e.target.files[0].name
		let splitFile = file.split(".");
		let lastVal = splitFile.pop();
		if( lastVal == 'jpeg' ||
			lastVal == 'tif'  ||
			lastVal == 'tiff' ||
			lastVal == 'bmp'  ||
			lastVal == 'jpg'  ||
			lastVal == 'png'
		){
			uploadFileToFirebase(e.target.files[0], `${currentUser.uid}/profile_pic/${dt}`).then((imgLink) => {
				setUserData({ ...userData, [fieldName]: imgLink });
				handleSubmit('profile_pic', { ...userData, [fieldName]: imgLink }, user)
			});
		}else {
			setShowError(true)
		}
	};

	return (
		<form className='form-edit-profile'>
			{loader ?
				<Loader/>
				:
				<div className='umaBtn attachFile upload'>
					<FiUpload className='attachFile__icon' />
					<p>Buscar imagen</p>
					<input type='file' className='input-file' name='profile_pic' onChange={(e) => uploadImage(e)} />
				</div>
			}
			{showError && <p className='invalidField'>Por favor elija un formato de imagen valido</p>}
		</form>
	);
};

export const PersonalHistory = ({ title, children, section }) => {
	return(
		<section className='profile-history'>
			<section className='header-section-info'>
				<h3 className='text'>{title}</h3>
				<EditButton section={section}/>
			</section>
			{children}
		</section>
	)
};

export const PersonalData = ({ user }) => {
	const dispatch = useDispatch();
	const { currentUser } = useSelector((state) => state.userActive)
	const [errorsInputs, setErrorsInputs] = useState({dni: false, ws: false})
	const [errorMsg, setErrorMsg]= useState('')
	const [userData, setUserData] = useState({
		address: user.address || '',
		corporate: user.corporate || '',
		country: user.country || '',
		dni: user.dni || '',
		dob: user.dob || '',
		fullname: user.fullname || '',
		piso: user.piso || '',
		sex: user.sex || '',
		ws: user.ws || '',
	});

	const handleChange = (e) => {
		setErrorMsg('')
		if(e.target.name === 'dni') {
			if (e.target.value.length >= 7 && e.target.value.length <= 8) {
				setErrorsInputs({...errorsInputs, dni: false})
				setUserData({ ...userData, dni: e.target.value })
			}else {
				setErrorsInputs({...errorsInputs, dni: true})
			}
		}if(e.target.name === 'ws') {
			if (checkNum(e.target.value)) {
				setErrorsInputs({...errorsInputs, ws: false})
				setUserData({ ...userData, ws: e.target.value })
			}else {
				setErrorsInputs({...errorsInputs, ws: true})
			}
		}else {
			setUserData({ ...userData, [e.target.name]: e.target.value });
		}
	};

	const handleSubmit = async (e, userData, user) => {
		e.preventDefault();
		if(errorsInputs.dni === false & errorsInputs.ws === false) {
			dispatch({type: 'LOADING', payload: true})
			let data = {
				newValues: { ...userData },
				uid: currentUser.uid
			};
			await currentUser.getIdToken().then(async token => {
				let headers = { 'Content-Type': 'Application/Json', 'Authorization': `Bearer ${token}` }
				if(currentUser.uid === user.id) {
					await axios.patch(`${node_patient}/update/${currentUser.uid}`, data, {headers})
					.then((res) => {
						dispatch({ type: 'TOGGLE_DETAIL' });
						dispatch({ type: 'GET_PATIENT', payload: data.newValues});
					})
					.catch((err) => {
						dispatch({ type: 'TOGGLE_DETAIL' });
						console.log(err);
					});
				}else {
					await axios.patch(`${node_patient}/updateDependant/${user.id}`, data, {headers})
					.then((res) => {
						dispatch({ type: 'TOGGLE_DETAIL' });
					})
					.catch((err) => {
						dispatch({ type: 'TOGGLE_DETAIL' });
						console.log(err);
					});
				}
			})
			dispatch({type: 'LOADING', payload: false})
		}else {
			setErrorMsg('Por favor compruebe que los datos introducidos cumplan con las condiciones')
		}
	};

	return (
		<form className='form-edit-profile' onSubmit={(e) => handleSubmit(e, userData, user, dispatch)}>
			<div>
				<GenericInputs
					label='Nombre'
					type='text' 
					name='fullname'
					action={e=>handleChange(e)}
					value={userData.fullname}
				/>
			</div>
			<div>
				<GenericInputs
					label='Tel??fono'
					type='number' 
					name='ws'
					action={e=>handleChange(e)}
					value={userData.ws}
				/>
				{errorsInputs.ws && <p className='invalidField'>El n??mero de tel??fono debe tener al menos 10 n??meros</p>}
			</div>
			<div>
				<GenericInputs
					label='DNI/Documento de identidad'
					type='number' 
					name='dni'
					value={userData.dni}
					action={e=>handleChange(e)}
				/>
				{errorsInputs.dni && <p className='invalidField'>El documento de identidad debe tener al menos 7 n??meros</p>}
			</div>
			<div>
				<GenericInputs
					label='Selecciona tu fecha de nacimiento'
					type='date'
					name='dob'
					value={userData.dob}
					action={(e) => handleChange(e)}
				/>
			</div>
			<div>
				<GenericInputs
					label='Obra social o cobertura de salud'
					type='text' 
					name='corporate'
					value={userData.corporate}
					action={e=>handleChange(e)}
				/>
			</div>
			<div>
				<GenericInputs
					label='Direcci??n'
					type='text' 
					name='address'
					action={e=>handleChange(e)}
					value={userData.address}
				/>
			</div>
			<div>
				<GenericInputs
					label='Piso/Depto'
					type='text' 
					name='piso'
					action={e=>handleChange(e)}
					value={userData.piso}
				/>
			</div>
			<div className='select-sex'>
 				<label className='sex-label'>Sexo</label>
 				<select onChange={(e) => setUserData({ ...userData, sex: e.target.value })}>
 					<option value={user.sex}>Seleccionar</option>
 					<option value='M'>Hombre</option>
 					<option value='F'>Mujer</option>
 					<option value='O'>Otro</option>
 				</select>
 			</div>
			 {errorMsg !== '' && <p className='invalidField'>{errorMsg}</p>}
			<button className='button-submit-edit' type='submit'>
				Guardar
			</button>
		</form>
	);
};
