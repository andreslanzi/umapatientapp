import React, {useRef} from 'react'
import { useSelector, useDispatch } from "react-redux"
import { AiOutlineClose, AiOutlineUpload } from 'react-icons/ai'
import moment from 'moment'
import DayTimeSelector from "./Components/DayTimeSelector"
import HoursSelector from "./Components/HoursSelector"
import { IconContext } from "react-icons";
import { uploadFileToFirebase } from '../Utils/postBlobFirebase';

export default function PillCreate({handleSaveReminder}) {
    const { personalizedShifts, newReminder, isEdition } = useSelector(state => state.pillbox)
    const dispatch = useDispatch()
    const fileRef = useRef()
    const { dni } = useSelector(state => state.user)

    const uploadFileClick = () => {
        fileRef.current.click()
    }

	const uploadImage = (e) => {
		const dt = moment().format('DD-MM-YYYY_HH:mm:ss');
		const currentFile = e.target.files[0];
        const fileName = e.target.files[0].name;
        console.log(`${dni}/pillbox/${dt}_${fileName}_${newReminder.medicine || ''}`)
        uploadFileToFirebase(currentFile, `${dni}/pillbox/${dt}_${fileName}_${newReminder.medicine || ''}`)
        .then(url => {
            dispatch({type: "SET_NEW_REMINDER", payload:{...newReminder, imagePath: url}})
        })
	};


    return (
        <div className='createContent__container'>
            <div className='pillCreate__header'>
                <p className='content'>{isEdition ? 'Editar':'Nuevo'} recordatorio</p>
                <AiOutlineClose className='icon' onClick={()=>dispatch({type: "SET_RENDER_STATE", payload:"LIST"})}/>
            </div>
        <div className='pillForm'>
        <div className='inputText__container uploadImageInput' onClick={() => uploadFileClick()}>
            <input ref={fileRef} onChange={e => uploadImage(e)} type="file" name="" id="" style={{display: 'none'}}/>
            <label>Suba una foto de su medicamento (opcional) </label>
            {newReminder.imagePath? 
            <div className='image__container'>
                <img className='pill_image' src={newReminder?.imagePath} alt="defaultPill"/> 
            </div>
            : ''}
            <AiOutlineUpload className='uploadIcon'/>
            <input readOnly placeholder='Seleccione un archivo' className="form-control" type="text" name="" id=""/>
        </div>
        <div className='inputText__container'>
            <label>Medicamento </label>
            <input defaultValue={isEdition ? newReminder.medicine:''} placeholder='Nombre (Ej: Ibuprofeno 600)' className="form-control" type="text" name="" id="" onChange={(e) => dispatch({type: "SET_NEW_REMINDER", payload:{...newReminder, medicine: e.target.value}})}/>
        </div>
        <div className='inputText__container'>
            <label>Formato </label>
            <select defaultValue={isEdition ? newReminder.format:''} placeholder='Selecciona una opci??n' className="form-control" name="" id="" onChange={(e) => dispatch({type: "SET_NEW_REMINDER", payload:{...newReminder, format: e.target.value}})}>
                <option value='comprimido'>Comprimido</option>
                <option value='jarabe'>Jarabe</option>
                <option value='crema'>Crema</option>
                <option value='gotas'>Gotas</option>
            </select>
        </div>
        <div className='inputText__container'>
            <label>Fecha de inicio</label>
            <input defaultValue={isEdition ? newReminder.initial_date:''} className="form-control" type="date" name="" id="" onChange={(e) => dispatch({type: "SET_NEW_REMINDER", payload:{...newReminder, initial_date: e.target.value}})}/>
        </div>
        <div className='inputText__container'>
            <label>Fecha de fin (opcional)</label>
            <input defaultValue={isEdition ? newReminder.end_date:''} className="form-control" type="date" name="" id="" onChange={(e) => dispatch({type: "SET_NEW_REMINDER", payload:{...newReminder, end_date: e.target.value}})}/>
        </div>
        <div className='inputText__container'>
            <label>Cantidad</label>
            <input defaultValue={isEdition ? newReminder.dose:'1'} className="form-control" placeholder='1' type="number" name="" id="" onChange={(e) => dispatch({type: "SET_NEW_REMINDER",payload:{...newReminder, dose: e.target.value}})}/>
        </div>

        <div className='inputText__container'>
            <label>Configure los d??as y horarios en los que debe tomar su medicaci??n</label>
        </div>

        <div>
            <HoursSelector defaultValues={isEdition ? newReminder.reminders:''} value={!personalizedShifts} medicine={newReminder.medicine}/>
        </div>

        <hr className='separator'/>

        <div>
            <DayTimeSelector defaultValues={isEdition ? newReminder.reminders:''} value={personalizedShifts} medicine={newReminder.medicine}/>
        </div>

        <div className='inputText__container'>
            <label>Stock</label>
            <input defaultValue={isEdition ? newReminder.stock:''} placeholder='Cantidad en stock' className="form-control" type="number" name="" id="" onChange={(e) => dispatch({type: "SET_NEW_REMINDER",payload:{...newReminder, stock: e.target.value}})}/>
        </div>
        <div className='inputText__container'>
            <label>Observaciones</label>
            <textarea defaultValue={isEdition ? newReminder.obs:''} className="form-control observations" placeholder='Tomar una cucharada antes de la comida, en ayunas, etc.' type="number" name="" id="" onChange={(e) => dispatch({type: "SET_NEW_REMINDER",payload:{...newReminder, obs: e.target.value}})}/>
        </div>
        <button
            className='save__button btn-blue-lg btn mb-3'
            onClick={isEdition? () => handleSaveReminder(true): () => handleSaveReminder(false)}
            >
            {isEdition?'Guardar':'Crear'} recordatorio
        </button>
    </div>
    </div>
    )
}
