import React from 'react'
import {Link, useParams} from 'react-router-dom';
import List from '../components/Appointments/Specialties/List';
import {GenericHeader, BackButton} from '../components/GeneralComponents/Headers';
import '../styles/appointments/Office.scss'

const Specialties = (props) => {
  const { activeUid } = useParams()
    return (
			<>
        <GenericHeader onClick={() => {props.history.go(`/${activeUid}/`)}}>Especialidades</GenericHeader>
        <BackButton />
        <div className="cal-fullheight">
            <List />
        </div>
        <Link to="./appointments/search-doctor">
          <div className="search-button">Buscar por médico</div>
        </Link>
        <div className="footer"></div>
			</>
    )
}

export default Specialties;