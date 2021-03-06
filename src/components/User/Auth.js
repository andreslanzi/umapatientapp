import React, { useEffect, useState} from "react";
import { useDispatch } from 'react-redux';
import db, {firebaseInitializeApp} from "../../config/DBConnection";
import { getAuth } from '../../store/actions/firebaseQueries';
import { getDocumentFB, snapDocumentsByFilter, getDocumentsByFilter, getCollectionFB } from '../Utils/firebaseUtils';
import { HiddenCacheClearer } from './VersionComponent';
import moment from 'moment-timezone';
import { getExistingDeliveryServices, getExistingOnSiteServices, setAllDeliveryServices, setAllOnSiteServices } from '../../store/actions/servicesActions'
export const AuthContext = React.createContext()

function AuthProvider({ children }) {
	const dispatch = useDispatch()
	const [currentUser, setCurrentUser] = useState(() => db.auth(firebaseInitializeApp).currentUser)

	useEffect(() => {  // Get authorization changes
		const unsubscribe = db.auth(firebaseInitializeApp).onAuthStateChanged(setCurrentUser)
		dispatch({ type: 'SET_LOGED_ACTIVE', payload: currentUser })
		if(currentUser) {
			getInitialData(currentUser)
		}
		return () => unsubscribe()
	}, [currentUser])

	useEffect(() => {
		if (currentUser) {
			currentUser.getIdToken().then(token => {
				localStorage.setItem(`token`, `Bearer ${token}`)
				dispatch({ type: 'SET_LOGED_TOKEN', payload: token })
			})
		}
	}, [currentUser])

    async function getDeliveryInfo(userAuth) {
		const params = await getDocumentFB('parametros/userapp/delivery/hisopados')
		dispatch({type: 'SET_DELIVERY_PARAMS', payload: params})
		if(userAuth.dni) {
			let filters =  [{field: 'status', value: ["PREASSIGN", "ASSIGN:DELIVERY", "ASSIGN:ARRIVED", "DONE:RESULT", "FREE:IN_RANGE", 'IN_PROCESS', 'FREE'], comparator: 'in'}, {field: 'patient.uid', value: userAuth.core_id, comparator: '=='}]
			await snapDocumentsByFilter('events/requests/delivery', filters, (data) => {
				if(data.length > 0) {
					dispatch({type: 'CLEAN_DELIVERY', payload: "CLEAN"})
					dispatch({type: 'SET_DELIVERY_ALL', payload: data})
					dispatch(setAllDeliveryServices(data))
				}
			})
		}
	}

    async function getOnSiteInfo(userAuth) {
		// const params = await getDocumentFB('parametros/userapp/analysis/abbott')
		const params = await getCollectionFB('parametros/userapp/analysis')
		dispatch({ type: 'SET_PARAMS_IN_PERSON_SERVICE', payload: params})
		if(userAuth.dni) {
			let filters = [{ field: 'status', value: ['FREE', 'PAYMENT', 'DONE:RESULT'], comparator: 'in' }, { field: 'patient.uid', value: userAuth.core_id, comparator: '==' }]
			await snapDocumentsByFilter('events/requests/analysis', filters, (data) => {
				if (data.length > 0) {
					dispatch(setAllOnSiteServices(data))
				}
			})
		}
	}

	async function getHisopadosInfo(userAuth) {
		const deliveryParams = await getDocumentFB('parametros/userapp/delivery/hisopados')
		// const onSiteParams = await getDocumentFB('parametros/userapp/analysis/abbott')
		const onSiteParams = await getCollectionFB('parametros/userapp/analysis')
		dispatch({ type: 'SET_DELIVERY_PARAMS', payload: deliveryParams })
		dispatch({ type: 'SET_PARAMS_IN_PERSON_SERVICE', payload: onSiteParams})

		if (userAuth.dni) {
			let deliveryFilters = [{ field: 'status', value: ["PREASSIGN", "ASSIGN:DELIVERY", "ASSIGN:ARRIVED", "DONE:RESULT", "FREE:IN_RANGE", 'IN_PROCESS', 'FREE'], comparator: 'in' }, { field: 'patient.uid', value: userAuth.core_id, comparator: '==' }]
			let onSiteFilters = [{ field: 'status', value: ['FREE', 'PAYMENT', 'DONE:RESULT'], comparator: 'in' }, { field: 'patient.uid', value: userAuth.core_id, comparator: '==' }]

			await getDocumentsByFilter('events/requests/delivery', deliveryFilters)
				.then(data => {
					if (data.length > 0) {
						dispatch(getExistingDeliveryServices(data))
					}
				})
			await getDocumentsByFilter('events/requests/analysis', onSiteFilters)
				.then(data => {
					if (data.length > 0) {
						dispatch(getExistingOnSiteServices(data))
					}
				})
		}
	}

	async function getInitialData(user) {
		const userAuth = await getAuth(user.uid)
		let plan = undefined;
		plan = await getCoverage(userAuth)
		if (!!userAuth) {
			dispatch({ type: 'GET_PATIENT', payload: userAuth })
			dispatch({ type: 'SET_USER_LOGIN', payload: userAuth.login })
			dispatch({ type: 'SET_PLAN_DATA', payload: plan })
			await getHisopadosInfo(userAuth)
			await getDeliveryInfo(userAuth)
			await getOnSiteInfo(userAuth)
			const fecha = userAuth.dob.split('-').join('')
			window.gtag('set', 'user_properties', {
				'primary_corporate': userAuth.corporate_norm,
				'sex': userAuth.sex,
				'age': moment().diff(moment(fecha, 'YYYYMMDD'), 'years')
			  });
		}
	}	
	
	const getCoverage = async (user) => {
		// Busco BASIC primero porque es el b??sico sin ningun permiso
		let plan = await getDocumentFB('services/porfolio/BASIC/active')
		
		if (!!user?.coverage && Array.isArray(user?.coverage) && plan) { 
			let all_coverages = user.coverage
			user.coverage.push({plan: user.corporate_norm, type: "corporate_norm"})
			// Un usuario puede tener multiples subscriptions
			// El usuario tiene como servicios el resultado de la sumatoria de ellos (de los true)
			all_coverages.forEach(async each => {
				if(each?.plan) {
					let path = `services/porfolio/${each?.plan?.toUpperCase()}/active`
					let coverageTemp = await getDocumentFB(path)
					for (const service in coverageTemp) {
						if(coverageTemp[service] === true) {
							plan.plan[service] = true
						}
					}
				}
			})
		}
		return plan
	}



	return (
		<AuthContext.Provider value={{ currentUser }}>
			{/* <HiddenCacheClearer /> */}
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider