import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd, faUserNurse, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { HistoryHeader } from '../GeneralComponents/Headers';
import { getMedicalRecord } from '../../store/actions/firebaseQueries';
import '../../styles/history/MyRecords.scss';

const MyRecords = () => {
    // const {category} = useParams();
    const dispatch = useDispatch()
    const [tab, setTab] = useState(false)
    const records = useSelector(state => state.queries.medicalRecord)
    const {beneficiaries} = useSelector(state => state.queries)
    const patient = useSelector(state => state.user)


    useEffect(() => { 
        window.scroll(0, 0);
    }, [patient])

    function selectBeneficiarieMr(p) {
        if (p === 'owner') {
            console.log('owner')
            setTab(false)
            dispatch(getMedicalRecord(beneficiaries?.[0]?.group, beneficiaries[0]?.ws))
        } else {
            console.log('no owner')
            setTab(p.fullname)
            dispatch(getMedicalRecord(p.dni, p.ws))
        }
    }

    return (
        <>
            <HistoryHeader> Consultas </HistoryHeader>
            <main className='my-history-container'> 
                <div className='title-icon'>
                    <p className='font-weight-bold'>Consultas médicas</p>
                    {/* <button><FaSlidersH/></button> */}
                </div>
                {/*  Beneficiary cambia de lugar con el nuevo diseño*/}
                <div className='my-history-beneficiary'> 
                    {/* <button className={tab === patient.fullname ? 'active button-patient' : 'button-patient'} 
                            onClick={() => selectBeneficiarieMr('owner')}> {patient.fullname} </button>
                    {beneficiaries.map((p, index) => {
                        return <button className={tab === p.fullname ? 'active button-patient' : 'button-patient'}
                            onClick={() => selectBeneficiarieMr(p)}
                            key={index}> {p.fullname} </button>
                    })} */}
                    <select className='select-beneficiary'>
                        <FontAwesomeIcon icon={faSortDown} />
                        <option value=""> {patient.fullname} </option>
                    {beneficiaries.map((p, index) => {
                        return <option key={index} value={p.fullname}> {p.fullname} </option>
                    })}
                    </select>
                </div>
                {/* --- */}
                <ul>
                    {records && records.length === 0 && <div className='no-records'>
                        Aún no se encontraron registros para esta persona.</div>}
                    {records && records.map((r, index) => {
                        return ( 
                            r.mr.destino_final !== 'USER CANCEL' && 
                            r.mr.destino_final !== 'Anula el paciente' && r.mr.destino_final !== 'Paciente ausente' &&
                            r.mr.dt_cierre !== '' &&  r.incidente_id !== 'auto' &&
                            <React.Fragment key={index}>
                                {console.log(r)}
                                <li className='my-history-consultation'>
                                        <Link to={`/history/${r.patient.dni}/${r.assignation_id}/${r.patient.ws}`} className='consult-link'>
                                            
                                                <div className='left-icon'>
                                                {r.mr_preds.pre_clasif == '' ?
                                                    <FontAwesomeIcon icon={faUserNurse} />
                                                    : 
                                                    <FontAwesomeIcon icon={faUserMd} />
                                                }
                                                </div>
                                                <section className='title-date'> 
                                                        {r.mr_preds.pre_clasif == '' ?
                                                        <p className='title-clasif'>Guardia</p> 
                                                        : 
                                                        <p className='title-clasif'>Médico clínico</p>
                                                        }
                                                    
                                                    <p className='consult-date'>{!!r.mr && moment(r.mr.dt_cierre).format('DD-MM-YYYY')}</p>
                                                </section>
                                        </Link>
                                    </li>
                                <hr/>
                            </React.Fragment>
                        )
                    })}
                </ul>
            </main>
        </>
    )
}

export default MyRecords;