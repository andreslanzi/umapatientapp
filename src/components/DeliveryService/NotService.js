import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import error from "../../assets/icons/error.svg";
import especialista from "../../assets/icons/icon-especialista.svg";
import autodiagnostico from "../../assets/icons/icon-autodiagnostico.svg";
import '../../styles/deliveryService/notService.scss';
import { FaArrowRight } from 'react-icons/fa'

const NotService = () => {
  const history = useHistory();
  const { patient } = useSelector((state) => state.queries);

  return (
    <div className="notService__container">
      <img src={error} alt="ALgo salió mal" className="notService__img" />
      <h2 className="notService__title">Algo salió mal</h2>
      <p className="notService__text">No hemos encontrado lo que buscabas, pero tal vez te interese esto</p>

      <button className="notService__button" onClick={() => history.push(`/${patient.ws}/onlinedoctor/who`)}>
        <div>
          <img src={especialista} alt="Consulta médica"/>
          <span>Quiero una consulta médica</span>
        </div>

        <FaArrowRight />
      </button>

      <button className="notService__button" onClick={() => history.push(`/${patient.ws}/autonomous`)}>
        <div>
          <img src={autodiagnostico} alt="Autodiagnóstico"/>
          <span>Hacer autodiagnóstico</span>
        </div>

        <FaArrowRight />
      </button>

      <button className="notService__link" onClick={() => history.push('/')}>
        Ir a inicio
      </button>
    </div>
  )
}

export default NotService
