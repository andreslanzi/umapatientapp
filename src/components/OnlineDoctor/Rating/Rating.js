import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import StarRatings from 'react-star-ratings';
import moment from 'moment-timezone';
import swal from 'sweetalert';
import axios from 'axios';
import queryString from 'query-string';
import { feedback } from '../../../config/endpoints';
import { getMedicalRecord } from '../../../store/actions/firebaseQueries';

const Rating = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const [ratingApp, setRatingApp] = useState(0);
	const [ratingMed, setRatingMed] = useState(0);
	const [notes, setNotes] = useState('');
	const token = useSelector((state) => state.userActive.token);
	const patient = useSelector((state) => state.user);
	const mr = useSelector((state) => state.queries.medicalRecord);
    const uid = useSelector(state => state.userActive?.currentUser?.uid)
	const location = useLocation()
    const { dependant, activeUid } = queryString.parse(location.search)

    React.useEffect(() => {
        let local = JSON.parse(localStorage.getItem('appointmentUserData'))
        try {
            let p = local.dni || patient.dni
            dispatch(getMedicalRecord(p, patient.ws))
        } catch (err) {
            console.log(err)
        }
    }, [dispatch, patient])

	useEffect(() => {
		if (
			mr[0] &&
			(mr[0].mr_preds.temperatura !== '' ||
				mr[0].mr_preds.traslado !== '' ||
				mr[0].mr.destino_final === 'Paciente Ausente' ||
				mr[0].mr.destino_final === 'Anula Paciente' ||
				mr[0].mr.destino_final === 'Anula por falla de conexión')
		) {
			dispatch({ type: 'RESET_ALL' });
			history.push('/home');
		} else if (mr[0] && mr[0].mr.destino_final === 'Paciente ausente') {
			dispatch({ type: 'RESET_ALL' });
			swal(
				'El médico cerró tu atención.',
				'Motivo: Paciente ausente. Puede realizar una nueva consulta.',
				'warning'
			);
			history.push('/home');
		} else if (mr[0] && mr[0].mr.destino_final === 'Anula el paciente') {
			dispatch({ type: 'RESET_ALL' });
			swal(
				'El médico cerró tu atención.',
				'Motivo: Anula el paciente. Puede realizar una nueva consulta.',
				'warning'
			);
			history.push('/home');
		} else if (mr[0] && mr[0].mr.destino_final === 'Anula por falla de conexión') {
			dispatch({ type: 'RESET_ALL' });
			swal(
				'El médico cerró tu atención.',
				'Motivo: Anula por falla de conexión. Puede realizar una nueva consulta.',
				'warning'
			);
			history.push('/home');
		}
	}, [mr]);

    const submitRating = useCallback(
		async () => {
			if(ratingApp === 0 || ratingMed === 0) {
				swal("Debes poner una calificación!", "No te olvides de puntuar al médico y a la aplicación", "warning")
				return ""
			}
			let headers = { 'Content-Type': 'Application/Json', 'Authorization': token }
			try {
				let date = moment(new Date()).tz("America/Argentina/Buenos_Aires").format('YYYY-MM-DD HH:mm:ss')
				let u = JSON.parse(localStorage.getItem('appointmentUserData'))
				// let mr = JSON.parse(localStorage.getItem('userMr'))
				// let assignation_id = JSON.parse(localStorage.getItem('currentMr'))
				let data = {
					'ws': u.ws,
					'dni': u.dni,
					'dt': date,
					'assignation_id': mr[0].assignation_id,
					'uma_eval': ratingApp.toString(),
					'doc_eval': ratingMed.toString(),
					'notes': notes.replace(/(\r\n|\n|\r)/gm, "").trim(),
					'uid': uid,
					'uid_dependant': dependant === 'true' ? activeUid : false
				}
				if (!mr[0] && mr[0].assignation_id) {
					data = { ...data, 'assignation_id': mr[0].assignation_id, }
				}
				await axios.post(feedback, data, headers)
				history.push('/home')
			} catch (err) {
				console.error(err)
				history.push('/home')
			}
		},
		[ratingApp, ratingMed],
	)
       
    

    return (
			<div className="ratings-container text-center p5">
				<label>¿Cómo evaluaría la aplicación?</label>
					<StarRatings
							rating={ratingApp}
							changeRating={setRatingApp}
							numberOfStars={5}
							name='rating'
							starDimension="40px"
							starRatedColor="#42A5F6"
							starHoverColor="#0071F2"
					/>
					<label>¿Cómo evaluaría al médico?</label>
					<StarRatings
							rating={ratingMed}
							changeRating={setRatingMed}
							numberOfStars={5}
							name='rating'
							starDimension="40px"
							starRatedColor="#42A5F6"
							starHoverColor="#0071F2"
					/>
					<textarea placeholder="Comentarios sobre la atención" onChange={(e) => setNotes(e.target.value)}></textarea>
					<button className="btn btn-blue-lg mt-5" onClick={() => submitRating()}>Enviar</button>
				</div>
		)
}

export default Rating;
