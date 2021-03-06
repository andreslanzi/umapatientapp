import React from "react";
import UMAIcon from "../../../assets/icons/icon.png";
import "../../../styles/generalcomponents/Loaders.scss";

export function CustomUmaLoader() {
  return (
    <div className="umaLoader">
      <div className="umaLoader__container">
        <img src={UMAIcon} alt="" className="umaLoader__container--img" />
      </div>
      <div className="umaLoader__container">
        <div className="umaLoader__container--loader absolute"></div>
      </div>
      <div className="umaLoader__container">
        <p className="umaLoader__container--text">Cargando...</p>
      </div>
    </div>
  )
}

export function Loader() {
  return <div className="loader"></div>
}
