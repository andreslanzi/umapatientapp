import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useHistory } from "react-router-dom"
import { FaMapMarker, FaBriefcaseMedical, FaClock, FaCheckCircle, FaCartPlus} from "react-icons/fa"
import TermsConditions from "./TermsConditions"
import FrequentQuestions from "./FrequentQuestions"
import NarrowContactInfo from "./NarrowContactInfo"
import IllustrationHisopado from "../../../../assets/img/Illustration-Hisopado.png"
import omsImg from "../../../../assets/img/oms.svg"
import axios from 'axios';
import {create_delivery, config} from '../../../../config/endpoints';
import db from "../../../../config/DBConnection";
import { BackButton } from '../../../GeneralComponents/Headers';
import swal from 'sweetalert';

export default function AskForBuyHisopado() {
    const [termsConditions, setTermsConditions] = useState(false)
    const [frequentQuestions, setFrequentQuestions] = useState(false)
    const [narrowContactInfo, setNarrowContactInfo] = useState(false)
    const {params, current} = useSelector(state => state.deliveryService)
    const patient = useSelector(state => state.queries.patient)
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if(patient.dni) {
            getCurrentService()
        }
    }, [patient])

    const getCurrentService = () => {
        db.firestore().collection('events/requests/delivery')
        .where('patient.dni', '==', patient.dni)
        .where('status', 'in', ['FREE', 'FREE:IN_RANGE'])
        .get()
        .then(res => {
            res.forEach(services => {
                let document = {...services.data(), id: services.id}
                dispatch({type: 'SET_DELIVERY_CURRENT', payload: document})
            })
        })
    }

    const startBuying = async () => {
        window.gtag('event', 'select_item', {
            'item_list_name': 'Hisopado Antígeno'
          });
        if(!current?.status) {
            let data = {
                dni: patient.dni,
                service: 'HISOPADO'
            }
            await axios.post(create_delivery, data, config)
                .then(async res => {
                    await getCurrentService()
                    dispatch({type: 'SET_DELIVERY_STEP', payload: "ADDRESS_PICKER"})
                })
                .catch(err => swal("Error", `No pudimos acceder al servicio en este momento. ${JSON.stringify(err.message)}`, "warning"))
        } else {
            dispatch({type: 'SET_DELIVERY_STEP', payload: "ADDRESS_PICKER"})
        }
    }

    const renderContent = () => {
        if(termsConditions){
            return <TermsConditions goBack={() => setTermsConditions(false)} />
        } else if (frequentQuestions) {
            return <FrequentQuestions goBack={() => setFrequentQuestions(false)}/>
        } else if (narrowContactInfo) {
            return <NarrowContactInfo goBack={() => setNarrowContactInfo(false)}/>
        } else {
            return (
                <div>
            <img className="hisopados-image" src={IllustrationHisopado}  alt="Hisopado" />
            <p className="hisopados-title">¡Comprá tu hisopado <br/> a domicilio!</p>
            <p className="hisopados-subtitle">(Sólo disponible en CABA)</p>
            <div className="price-center-aligner">
                <div className="price-container">
                <div className="discount-container">
                    <p className="hisopados-previous-price">${params?.fake_price}</p>
                    <p className="hisopados-discount">{params?.fake_discount}% off</p>
                </div>
                <p className="hisopados-price">${params?.price}</p>
                </div>
            </div>
            <div className="hisopados-bullets-container">
            <div className="hisopados-bullets">
                <p><FaMapMarker className="icon"/>A domicilio</p>
                <p><FaBriefcaseMedical className="icon"/>No invasivo</p>
            </div>
            <div className="hisopados-bullets">
                <p><FaCheckCircle className="icon"/>100% efectivo</p>
                <p><FaClock className="icon"/>Resultado en 15´</p>
            </div>
            </div>
            <p className="limited-p">Ahora puedes realizar el hisopado por <br/>COVID-19 desde la comodidad de tu casa.</p>
            <div className="oms-container">
            <img className="hisopados-image" src={omsImg} alt="oms" />
            Avalado por la OMS
            </div>
            
            <div className="hisopados-flux-container">
                <p className="info-title">¿En qué consiste?</p>
                <p>Es un test rápido de detección del COVID-19, realizado por nuestro personal de salud en tu domicilio. Es una excelente alternativa al hisopado tradicional, económica, indolora y veloz,<br/>¡En sólo 15 minutos tienes el resultado!</p>
                <p className="info-title">Medios de pago</p>
                <p>Puedes pagarlo con tarjeta de crédito y débito a través de MercadoPago.</p>
                <div className="info-warning">
                    <p className="warning-title">Atención: </p>
                    <ul>
                        <li>No emite certificado oficial</li>
                        <li>No es válido para viajar</li>
                        <li>No está cubierto por obras sociales</li>
                    </ul>
                </div>
                <br/>
                <p><u>Nota:</u> si compras el sábado, domingo o feriados el hisopado se realizará el lunes o primer día hábil</p>
                <p className="info-title">Contacto estrecho</p>
                <p>Si eres contacto estrecho y <u><b>no</b></u> presentas síntomas, es importante que te hagas el test a los <b>5 días</b> del contacto para asegurar la efectividad del resultado.</p>
                <p>¿Cómo saber si soy contacto estrecho? <br/> ¡Averígualo <a className="link__to__narrow__contact" onClick={()=>setNarrowContactInfo(true)}>aquí</a>!</p>
            </div>
            <p className="terms-questions">
                <span onClick={()=>setTermsConditions(true)}>Términos y condiciones</span>
                <br/>
                <br/>
                <span onClick={()=>setFrequentQuestions(true)}>Preguntas frecuentes</span>
            </p>
            <div onClick={() => params?.price ? startBuying(): ""} className="hisopados-button">
                <p className="button-text"><FaCartPlus className="icon"/>Comprar mi hisopado</p>
			</div>
        </div>)
        }
    }

    const goBackButton = () => {
        if (narrowContactInfo){return setNarrowContactInfo(false)}
        else {return history.push("/")}
    }
    
    return <>
            {!termsConditions && !frequentQuestions && <BackButton inlineButton={true} customTarget={patient.ws} action={()=>goBackButton()} />}
            {renderContent()}
           </>
}