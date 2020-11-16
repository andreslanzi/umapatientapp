import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {useHistory} from "react-router-dom"
import { FaChevronDown, FaChevronUp, FaTrashAlt } from 'react-icons/fa';
import { create_delivery } from '../../../config/endpoints';
import axios from 'axios';
import MobileModal from '../../GeneralComponents/Modal/MobileModal';
import DeliverySelectDestiny from '../DeliverySelectDestiny';
import ZoneCoveredHisopado from "../DeliveryPurchase/Components/ZoneCoveredHisopado"

const HisopadoCartItem = ({patient, id}) => {
    const { dni } = useSelector(store => store.queries.patient);
    const { address, piso, depto, lat, lng } = useSelector(store => store.deliveryService.selectHomeForm);
    const dependantInfo = useSelector(store => store.deliveryService.dependantInfo);
    const [openUser, setOpenUser] = useState(patient.isOpen);
    const [openModal, setOpenModal] = useState(false);
    const [showBtn, setShowBtn] = useState(true);
    const [data, setData] = useState({
        title: patient.title,
        fullname: patient.fullname,
        dni: patient.dni,
        ws: patient.ws,
        dob: patient.dob,
        sex: patient.sex,
        obs: '',
        address: patient.address || address,
        piso: patient.piso || piso,
        depto: patient.depto || depto,
        lat: patient.lat || lat,
        lng: patient.lng || lng
    });
    const [isAddressValid, setIsAddressValid] = useState(true)
    const history = useHistory()

    useEffect(() => {
        if(Object.entries(dependantInfo).length !== 0) {
            setData({...data,
            address: dependantInfo.address,
            piso: dependantInfo.piso,
            depto: dependantInfo.depto,
            lat: dependantInfo.lat,
            lng: dependantInfo.lng
            });
            if(dependantInfo.isAddressValidForHisopado !== undefined){
                setIsAddressValid(dependantInfo.isAddressValidForHisopado)
            } 
            if(dependantInfo.isAddressValidForHisopado){
                setOpenModal(false);
            }
        }
    }, [dependantInfo])

    const handleConfirm = () => {
        setShowBtn(false);
        setOpenUser(false);

        let sendData = {
            dni,
            service: 'HISOPADO',
            dependant: true,
            dependantData: {
                sex: data.sex,
                dob: data.dob,
                dni: data.dni,
                ws: data.ws,
                user: data.fullname
            },
            dependantDestination: {
                user_address: data.address,
                user_floor: data.piso,
                user_number: data.depto,
                user_lat: data.lat,
                user_lon: data.lng
            }
        }

        let headers = { 'Content-Type': 'Application/Json' }

        axios.post(create_delivery, sendData, headers)
            .then(res => console.log(res))
            .catch(err => console.log(err))
    }

    return (
        <article className="HisopadoCart__user">
            <div className="HisopadoCart__userTitle" onClick={() => {
                setOpenUser(!openUser);
            }}>
                <p className="HisopadoCart__userName">{data.fullname || data.title}</p>
                {
                !openUser ?
                <FaChevronDown /> :
                <FaChevronUp />
                }
            </div>
            <div className={`HisopadoCart__userData ${openUser ? 'open' : ''}`}>
                <div>
                    <label>Nombre y apellido</label>
                    <input 
                        type="text"
                        required
                        inputMode="text" 
                        value={data.fullname || ''} 
                        onChange={(e) => {
                            setData({...data, title: e.target.value, fullname: e.target.value});
                        }}
                    />
                </div>

                <div>
                    <label>Identificación, cédula o DNI</label>
                    <input 
                        type="text"
                        required
                        inputMode="numeric"
                        value={data.dni || ''} 
                        onChange={(e) => {
                            setData({...data, dni: e.target.value});
                        }}
                    />
                </div>
                
                <div>
                    <label>N° de celular</label>
                    <input 
                        type="text"
                        required
                        inputMode="tel"
                        value={data.ws || ''} 
                        onChange={(e) => {
                            setData({...data, ws: e.target.value});
                        }}
                    />
                </div> 

                <div className="columns">
                    <div>
                        <label>Fecha de nacimiento</label>
                        <input 
                            type="date"
                            required     
                            value={data.dob || ''} 
                            onChange={(e) => {
                                setData({...data, dob: e.target.value});
                            }}
                        />
                    </div>
                    <div>
                        <label>Sexo</label>
                        <select
                            value={data.sex || 'none'} 
                            name="sexo"
                            onChange={(e) => {
                                setData({...data, sex: e.target.value});
                            }}
                        >
                            <option value="none" defaultValue disabled>- Seleccionar -</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label>Observaciones</label>
                    <input 
                        type="text"
                        inputMode="text"
                        placeholder="Aclaración para el personal médico" 
                        value={data.obs || ''}
                        onChange={(e) => {
                            setData({...data, obs: e.target.value});
                        }}
                    />
                </div>  

                <div>
                    <label>Domicilio</label>
                    <input 
                        type="text" 
                        value={data.address || ''} 
                        onChange={(e) => {
                            setData({...data, address: e.target.value});
                        }}
                        readOnly
                    />
                </div> 

                <div className="columns">
                    <div>
                        <label>Piso</label>
                        <input 
                            type="text" 
                            value={data.piso || ''} 
                            onChange={(e) => {
                                setData({...data, piso: e.target.value});
                            }}
                            readOnly
                        /> 
                    </div>
                    <div>
                        <label>Departamento</label>
                        <input 
                            type="text" 
                            value={data.depto || ''} 
                            onChange={(e) => {
                                setData({...data, depto: e.target.value});
                            }}
                            readOnly
                        /> 
                    </div>
                </div>

                {
                    id !== 0 && showBtn ?
                    <>
                        <button className="HisopadoCart__btnAddress" onClick={() => setOpenModal(true)}>Cambiar domicilio</button>
                        <button className="HisopadoCart__btnConfirm" onClick={handleConfirm}>Guardar</button>
                    </> :
                    null
                }
                
                <button className="HisopadoCart__btnDelete"><FaTrashAlt /></button>
            </div>

            {
                openModal &&
                <MobileModal callback={()=>setOpenModal(false)} surveyHisopados noScroll>
                    {isAddressValid? <DeliverySelectDestiny isModal />: <ZoneCoveredHisopado isModal={true} goPrevious={()=>{setIsAddressValid(true)}} history={history} />}
                </MobileModal>
            }
        </article>
    )
}

export default HisopadoCartItem;