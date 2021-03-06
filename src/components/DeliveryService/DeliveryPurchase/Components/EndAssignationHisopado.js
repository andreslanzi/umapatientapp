import React from 'react'
import hisopadosPay from "../../../../assets/img/hisopados_payment.svg"
import {useHistory} from "react-router-dom";
import "../../../../styles/hisopado/hisopadosFlux.scss";

export default function EndAssignationHisopado() {        
    const history = useHistory();

    return (
        <div className="allwhite-hisopados-background" >
            <div className="instructions-container">
                <img src={hisopadosPay} alt="hisopados_tic" className="hisopados_cross"/>
                <p className="hisopados-title">¡Hemos recibido su pago!</p>
                <p>Tu solicitud de hisopado fue recibida. Nuestro personal sanitario se encuentra ocupado. En cuanto se desocupe, se dirigirá a tu domicilio. </p>

                <p>Debido a la alta demanda, la visita puede demorar.</p>

                <p>¡Puedes cerrar esta ventana!</p>
                <p>Te enviaremos una
                notificación cuando nuestro personal esté en camino.
                </p>
                <p>Aguarde unos instantes</p>
            <button className="go__home" onClick={() => history.push('/home')}>
                Ir a inicio
            </button>
            </div>
        </div>
    )
}
