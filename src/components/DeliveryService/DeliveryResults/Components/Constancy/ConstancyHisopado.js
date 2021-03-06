import React from 'react'
import { useSelector } from "react-redux";
import LogoUma from "../../../../../assets/logo.png"
import "./constancy.scss"
import moment from "moment"
import QRCode from 'qrcode.react';
class ConstancyHisopado extends React.Component {
    render(){

        const { patient, date, result, id } = this.props;
        
        return (
            <div className="constancyContainer">
                <img className="logo-uma" src={LogoUma} alt="logo" />
                <div className="patient-data">
                    <p>
                        <b>Paciente: </b> {patient.user}
                    </p>
                    <p>
                        <b>DNI: </b> {patient.dni}
                    </p>
                    <p>
                        <b>Fecha: </b> {moment(date).format("DD/MM/YYYY")}
                    </p>
                </div>
                <br/>
                <b>
                    Prueba rápida para detección de Antígenos para COVID-19
                </b>
                <br/>
                <div>
                    <div className="constancy-div">
                        <b className="constancy-subtitle">Método</b> <b>Inmuno-cronomatográfico (PANIBO™ COVID-19 AG RAPID TEST DEVICE)</b>
                    </div>
                    <br/>
                    <div className="constancy-div">
                        <b>Se realiza la toma de muestra mediante hisopado nasofaringeo.</b>
                    </div>
                    <br/>
                    <div className="constancy-div">
                        <b className="constancy-subtitle">Resultado:</b>
                        <b>{result === "POSITIVE" && "POSITIVO"} {result === "NEGATIVE" && "NEGATIVO"} </b>
                    </div>
                </div>
                <br/>
                <p>Resultados validados electrónicamente por Dr. Fernando Luis Raffo Bioquímico M. N. 6.925</p>
                
                {id && 
                <div className="constancy-qr">
                    <QRCode value={`http://uma-health.com/delivery/${id}`} />
                </div>}
            </div>
        )
    }
}

export default ConstancyHisopado;
