import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStethoscope,
  faDeaf,
  faFileMedicalAlt,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";
import FooterBtn from "../GeneralComponents/FooterBtn";
import MobileModal from "../GeneralComponents/Modal/MobileModal";
import FileService from "../GeneralComponents/SelectService/FileService";
import WellnessCard from "../../assets/checkout/wellness.png";
import "../../styles/wellness/wellness.scss";


const Wellness = props => {
  const { dni } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [modalFile, setModalFile] = React.useState({
    state: false,
    title: "biomarker",
    description: ""
  });
  const biomarkerHandler = biomarker =>
    setModalFile({ state: true, title: biomarker });

  return (
    <>
      {modalFile.state && (
        <MobileModal 
        isWellness 
        callback={() => {
          setModalFile(!modalFile.state)
          dispatch({type: "TOGGLE_DETAIL", payload: false})}}>
          <FileService
            patient={{dni: dni}}
            type="biomarker"
            title={modalFile.title}
            description={modalFile.description}
            modalClose={() => setModalFile(false)}
          />
        </MobileModal>
      )}
      <div className="biomarkers">
        <div className="biomarkers__comingSoon">
          <div className="biomarkers__comingSoon--title">
            <img src={WellnessCard} alt="Bienestar" />
          </div>
        </div>
        <div className="biomarkers__container">
          <div className="biomarkers__container--list">
            <ul className="markers">
              <li className="markers__item">
                <Link to={`/laboratorio/${dni}`}>
                  <div className="markers__item--icon active__marker">
                    <FontAwesomeIcon icon={faFileMedicalAlt} />
                    <div className="markers__item--info">
                      <FontAwesomeIcon icon={faInfo} />
                    </div>
                  </div>
                </Link>
              </li>
              <li
                className="markers__item"
                onClick={() => biomarkerHandler("sthethoscop")}
              >
                <div className={`markers__item--icon ${!!window.chrome? "active__marker": ""}`}>
                  <FontAwesomeIcon icon={faStethoscope} />
                  <div className="markers__item--info">
                    <FontAwesomeIcon icon={faInfo} />
                  </div>
                </div>
              </li>
              <li
                className="markers__item"
                onClick={() => biomarkerHandler("frank")}
              >
                <div className="markers__item--icon active__marker">
                  <FontAwesomeIcon icon={faDeaf} />
                  <div className="markers__item--info">
                    <FontAwesomeIcon icon={faInfo} />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <FooterBtn
        mode="single"
        text="Volver"
        callback={() => props.history.push("/")}
      />
    </>
  );
};

export default withRouter(Wellness);
