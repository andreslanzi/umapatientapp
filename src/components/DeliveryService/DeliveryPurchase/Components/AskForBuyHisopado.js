import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useHistory } from "react-router-dom"
import { FaCartPlus} from "react-icons/fa"
import Loading from '../../../GeneralComponents/Loading'
import TermsConditions from "./TermsConditions"
import FrequentQuestions from "./FrequentQuestions"
import NarrowContactInfo from "./NarrowContactInfo"
import axios from 'axios';
import {create_delivery, config} from '../../../../config/endpoints';
import db, {firebaseInitializeApp}  from "../../../../config/DBConnection";
import { BackButton } from '../../../GeneralComponents/Headers';
import swal from 'sweetalert';
import umaLogo from '../../../../assets/logo_original.png'
import { setNewDeliveryServices } from '../../../../store/actions/servicesActions'

export default function AskForBuyHisopado() {
    const isLocal = window.location.origin.includes('localhost');
    const [termsConditions, setTermsConditions] = useState(false)
    const [frequentQuestions, setFrequentQuestions] = useState(false)
    const [narrowContactInfo, setNarrowContactInfo] = useState(false)
    const {params, current} = useSelector(state => state.deliveryService)
    const patient = useSelector(state => state.user)
    const userActive = useSelector(state => state.userActive)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if(patient.dni) {
            getCurrentService()
        }
    }, [patient])

    const getCurrentService = async () => {
        let deliveryInfo = []
        await db.firestore(firebaseInitializeApp).collection('events/requests/delivery')
        .where('patient.uid', '==', patient.core_id)
        .where('status', 'in', ['FREE', 'FREE:IN_RANGE'])
        .get()
        .then(async res => {
            res.forEach(services => {
                let document = {...services.data(), id: services.id}
                deliveryInfo.push(document)
                dispatch({type: 'SET_DELIVERY_CURRENT', payload: document})
            })
        })
        dispatch({type: 'SET_DELIVERY_ALL', payload: deliveryInfo})
    }

    const startBuying = async () => {
        if(!isLocal){
        window.gtag('event', 'select_item', {
            'item_list_name': 'Hisopado Ant??geno'
          });
        }
        let data = {
            dni: patient.dni,
            uid: userActive.currentUser.uid,
            dependant: false,
            service: 'HISOPADO'
        }
        setLoading(true)
        await axios.post(create_delivery, data, config)
            .then(async res => {
                db.firestore(firebaseInitializeApp).doc(`/events/requests/delivery/${res.data.id}`)
                .get()
                .then(async query => {
                    let data = {
                        ...query.data(),
                        id: res.data.id
                    }
                    localStorage.setItem("multiple_clients", JSON.stringify([data]))
                    dispatch({type: 'SET_DELIVERY_ALL', payload: [data]})
                    dispatch({type: 'SET_DELIVERY_STEP', payload: "ADDRESS_PICKER"})
                    if (query.data()) {
                        dispatch(setNewDeliveryServices(data))
                    }
                    setLoading(false)
                })
            })
            .catch(err =>{ 
                swal("Algo sali?? mal", `No pudimos acceder al servicio en este momento. Intenta m??s tarde.`, "error")
                setLoading(false)
                console.log(err)
            })
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
                    {
                        !params.active &&
                        <article className="hisopados-alert">
                            Los hisopados se realizan de lunes a s??bados de 8hs a 20hs.
                        </article>
                    }
                    <div className="price-center-aligner">
                        <img src={umaLogo} alt='uma_logo' className='uma_logo_hisopados'/>
                        <h2 className="price-title">Test r??pido de ant??genos</h2>
                        <div className="price-container">
                            <div className="discount-container">
                                <p className="hisopados-previous-price">${params?.fake_price}</p>
                                <p className="hisopados-discount">{params?.fake_discount}% OFF</p>
                            </div>
                            <p className="hisopados-price">${params?.price}</p>
                        </div>
                        <p className="disclaimer-result">Indica la presencia del virus</p>
                    </div>
                    
                    <div className="coverage">
                        <button 
                            className="coverage-btn" 
                            onClick={() => history.push(`/hisopado/cobertura/${patient.ws}`)}
                        >
                            Conoc?? nuestra zona de cobertura
                        </button>
                        <br />
                        <span className="coverage-btn" onClick={()=>setFrequentQuestions(true)}>Preguntas frecuentes</span>
                    </div>

                    <div className='read-with-attention'>
                        <div className='read-with-attention-title'>
                            Leer con atenci??n
                        </div>
                        <div className='read-with-attention-content'>
                            <ul>
                                <li>
                                Los hisopados se realizan de <b>lunes a s??bados de 8hs a 20hs</b>, para todas las compras realizadas antes de las 18hs. 
                                <br/>
                                Si compras fuera de ese rango, te lo realizaremos al siguiente d??a h??bil.
                                <br/>
                                <b><u>No se realizan hisopados los d??as domingos ni feriados.</u></b>
                                </li>
                                <li>
                                No lo cubren las obras sociales
                                </li>
                                <li>
                                Consulte con su destino la validez del test r??pido para viajar
                                </li>
                                <li>
                                <p className='blue-text'>El pago no admite cancelaciones ni devoluciones</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="hisopados-flux-container">                        
                        <p className="info-title-big">Medios de pago</p>
                        <p>Puedes pagarlo con tarjeta de cr??dito a trav??s de MercadoPago.</p>
                        <p className="info-important">Importante</p>
                        <hr className="info-important-line"/>
                        <p>S??lo aceptamos pagos por la <b><u>app </u></b> de ??MA o a trav??s de un <b><u>link </u></b> de pago enviado via mail por nuestro personal de ??MA.</p> 
                        <p>Recibir??s la factura por el servicio durante las pr??ximas 72 horas h??biles al email que utilizaste para acreditar tu pago.</p>
                        <p>Si te ofrecen abonar por otro medio, NO ACEPTES, y contactanos inmediatamente.</p>
                        
                    </div>
                    <div className="hisopados-flux-container">                        
                        <p className="info-title">Contacto estrecho</p>
                        <p>Si eres contacto estrecho y <u><b>no</b></u> presentas s??ntomas, es importante que te hagas el test a partir de los <b>5 d??as</b> del contacto para asegurar la efectividad del resultado.</p>
                        <p>??C??mo saber si soy contacto estrecho? <br/> ??Aver??gualo <a className="link__to__narrow__contact" onClick={()=>setNarrowContactInfo(true)}>aqu??</a>!</p>
                    </div>

                    <p className="terms-questions">
                        <span onClick={()=>setTermsConditions(true)}>T??rminos y condiciones</span>
                    </p>
                    <div onClick={() => params?.price ? startBuying(): ""} className="hisopados-button">
                        <p className="button-text"><FaCartPlus className="icon"/>Comprar mi hisopado</p>
                    </div>
                </div>
            )
        }
    }

    const goBackButton = () => {
        if (narrowContactInfo){return setNarrowContactInfo(false)}
        else {return history.push("/")}
    }
    
    return <>
            {!termsConditions && !frequentQuestions && <BackButton inlineButton={true} customTarget={patient.ws} action={()=>goBackButton()} />}
            {loading ? 
            <Loading /> : 
            renderContent()}
           </>
}
