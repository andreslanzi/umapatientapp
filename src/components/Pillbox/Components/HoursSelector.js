import React, {useState, useEffect, useCallback} from 'react'
import { useDispatch, useSelector } from "react-redux";
import Cleave from 'cleave.js/react';
import { FaPlus, FaMinus, FaTrashAlt } from "react-icons/fa"

export default function HoursSelector({value, medicine = false, defaultValues = false}) {
    const [hoursToSave, setHoursToSave] = useState([])
    const { personalizedShifts } = useSelector(state => state.pillbox)
    const dispatch = useDispatch()

    useEffect(() => {
        if(medicine){
            dispatch({type: "SET_SHIFTS_TO_POST", payload: {medicine: medicine, shifts: hoursToSave, personalized:false}})
        }
    }, [medicine, hoursToSave])

    useEffect(()=>{
        if(defaultValues){
            const values = []
            for(var hour of defaultValues){
                values.push(hour)
            }
            setHoursToSave(values)
        } else {
            setHoursToSave(["00:00"])
        }
    },[])

    const addHour = () => {
        setHoursToSave([...hoursToSave, "00:00"])
    }

    const removeHour = () => {
        let hours = hoursToSave.slice(0, -1)
        setHoursToSave(hours)
    }

    const editHour = (hour, indexHour) => {
        var hours = hoursToSave
        hours[indexHour] = hour
        setHoursToSave(hours)
    }

    const renderHours = () => {
        let content = hoursToSave.map((hour, indexHour) => {
            return (
            <div className="hours-selector initial-padding" key={hour}>
                <Cleave placeholder="hh:mm"
                options={{
                    time: true,
                    timePattern: ['h', 'm']
                }}
                value={hour}
                onChange={e => editHour(e.target.value, indexHour)} 
                className="time-input form-control"/>
                <FaTrashAlt className='icon' />
            </div>)}
        )
        return content
    }

    const changePersonalized = useCallback(()=>{
        dispatch({type: "SET_PERSONALIZED_SHIFTS", payload: !personalizedShifts})
    },[personalizedShifts])

    return <>
        {/* <div className="add-pill-shift-icon">
            <FaPlus className="add-icon" onClick={addHour}/>
            <FaMinus className="minus-icon" onClick={removeHour}/>
        </div> */}
        <div className='radioButton__container'>
            <div className='radioText'>
                <input type="radio" name="" id="" checked={!personalizedShifts} value={!personalizedShifts} onClick={()=>changePersonalized()}/>
                <p>TODOS LOS DÍAS</p>
            </div>
            <div className='addHour' onClick={addHour}>+</div>
        </div>
        {value && renderHours()}
        </>
}            
