import React, {useState, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useLocation, useHistory} from 'react-router-dom';
import moment from 'moment';
import { user_cancel } from '../../../../config/endpoints';
import swal from 'sweetalert';
import queryString from 'query-string';
import axios from 'axios';

const CancelAppointment = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const patient = useSelector(state => state.user)
    const { assignedAppointment } = useSelector(state => state.queries)
    const [cancelOptions, setCancelOptions] = useState('')
    const [cancelDescription, setCancelDescription] = useState('');
    const {id} = queryString.parse(location.search)
    const { currentUser } = useSelector((state) => state.userActive)

    async function cancelAppointment(type, claim = '') {
        dispatch({ type: 'LOADING', payload: true })
        let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        let path = localStorage.getItem('currentAppointment').slice(1,-1)
        let documentBuild = `assignations/${path}`
        if(verifyIfCanCancel()) return;
        try {
            let data = {
                ws: patient.ws,
                dni: patient.dni || '',
                dt: date || '',
                assignation_id: id,
                appointment_path: documentBuild || '',
                type: 'cancel',
                complain: claim.replace(/(\r\n|\n|\r)/gm, '').trim() || ''
            }
            // Verify if the attention is not canceled or closed
            await currentUser.getIdToken().then(async token => {
                let headers = { 'Content-Type': 'Application/Json', 'Authorization': token }
                await axios.post(user_cancel, data, {headers})
                swal(`Consulta cancelada`, 
                `Será redireccionado/a al inicio`, 
                'success')
            })
            dispatch({ type: 'RESET_ALL' })
            dispatch({ type: 'LOADING', payload: false })
            return history.push('/home')
        } catch (err) {
            console.error(err)
            dispatch({ type: 'ERROR', payload: err })
            dispatch({ type: 'RESET_ALL' })
            dispatch({ type: 'LOADING', payload: false })
            if (type === 'cancel') {
                return history.push('/home')
            }
        }
    }

    const verifyIfCanCancel = () => {
        if(assignedAppointment && (assignedAppointment.status === "ATT" || assignedAppointment.status === "DONE")) {
            swal(`No se puede cancelar esta atención`, 
            `La atención ya fue iniciada por el médico.`, 
            'warning')
            return true
        }
        return false
    }

    return(
        <div className="action__container">
            <div className='action__bullets'>
            <h2>Por favor selecciona el motivo de la cancelación</h2>
                <div className='custom-control custom-radio'>
                    <input onChange={() => setCancelOptions('Me arrepentí')}
                        type='radio' id='customRadio1' name='customRadio' className='custom-control-input'
                    />
                    <label className='custom-control-label' htmlFor='customRadio1'>Me arrepentí</label>
                </div>
                <div className='custom-control custom-radio'>
                    <input onChange={() => setCancelOptions('Demasiada espera')}
                        type='radio' id='customRadio2' name='customRadio' className='custom-control-input'
                    />
                    <label className='custom-control-label' htmlFor='customRadio2'>Demasiada espera</label>
                </div>
                <div className='custom-control custom-radio'>
                    <input onChange={() => setCancelOptions('Error en la consulta anterior')}
                        type='radio' id='customRadio3' name='customRadio' className='custom-control-input'
                    />
                    <label className='custom-control-label' htmlFor='customRadio3'>Error en la consulta anterior</label>
                </div>
                <div className='custom-control custom-radio'>
                    <input onChange={() => setCancelOptions('otro')}
                        type='radio' id='customRadio4' name='customRadio' className='custom-control-input'
                    />
                    <label className='custom-control-label' htmlFor='customRadio4'>Otro</label>
                </div>
                {cancelOptions === 'otro' &&
                    <textarea onChange={e => setCancelDescription(e.target.value)} value={cancelDescription}></textarea>
                }
            </div>
            <button className='umaBtn' onClick={() => cancelAppointment()}>
                Confirmar
            </button>
        </div>
    )
}

export default CancelAppointment;