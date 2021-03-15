import React, {useState, useEffect} from 'react';
import Logo from '../../../assets/logo.png';
import {checkNum} from '../../Utils/stringUtils';
import {useSelector, useDispatch} from 'react-redux';
import { ConditionButtons, GenericInputs, TextAndLink, Stepper, GenericButton, SelectOption } from '../Login/GenericComponents';
import { useHistory, useParams } from 'react-router-dom';
import Firebase from 'firebase/app';
import axios from 'axios';
import Modal from '../SignUp/Modal';
import moment from 'moment-timezone';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Calendar } from 'react-date-range';
import es from 'date-fns/locale/es';
import {node_patient} from '../../../config/endpoints';
import '../../../styles/user/signUp/signUp.scss';
import { useForm } from "react-hook-form";
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CalendarIcon from '../../../assets/calendar.png'; 
import swal from 'sweetalert';

const Register = () => {
    const {screen} = useParams()
    const history = useHistory()
    const dispatch = useDispatch()
    const { register, handleSubmit, errors } = useForm();
    const userActive = useSelector(state => state.userActive)
    const [switchContent, setSwitchContent] = useState('1')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [healthinsurance, setHealthinsurance] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [sex, setSex] = useState(null)
    const [active, setActive] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const [date, setDate] = useState(null)
    const [emailExists, setEmailExists] = useState(false)
    const [showError, setShowError] = useState([{
        dob: false,
        sex: false
    }])

    useEffect (()=> {
        if (screen) {
            switch(screen) {
                case '1': setSwitchContent('1')
                break;
                case '2': setSwitchContent('2');
                break;
                default: history.push('/');
            }
        }
    }, [screen])

    const handleCreateUser = async (data) => {
        if(data.email && data.password) {
            try {
                await Firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
                .then(async user => {
                    setSwitchContent('2');
                })
                .catch(e => {
                    if (e.code === 'auth/email-already-in-use' || e.code === 'auth/account-exists-with-different-credential') {
                        const headers = { 'Content-type': 'application/json' };
                        axios.post(`${node_patient}/emailexists`, { email: data.email }, headers)
                        .then(res => {
                            switch (res?.data?.details[0]?.providerId) {
                                case 'microsoft.com':
                                    history.push('/signup/user/exists/microsoft');
                                    break;
                                case 'google.com':
                                    history.push('/signup/user/exists/google');
                                    break;
                                case 'facebook.com':
                                    history.push('/signup/user/exists/facebook');
                                    break;
                                case 'email':
                                    history.push('/signup/user/exists/email');
                                    break;
                                default:
                                    history.push('/signup/user/exists');
                            }
                        })
                    }
                });
            }catch {
                setEmailExists(true)
            }
        }
    }

    const updatePatient = async (uid, method, dataVal) => {
        const phoneChecked = checkNum(dataVal.phone)
        await Firebase.auth().currentUser.getIdToken().then(async token => {
            let headers = { 'Content-Type': 'Application/Json', 'Authorization': `Bearer ${token}` }
            let data = {
                newValues: {
                    login: [method],
                    email: email || Firebase.auth().currentUser?.providerData[0]?.email || '',
                    fullname: `${dataVal.firstname} ${dataVal.lastname}` || '',
                    dni: dataVal.dni || '',
                    ws: phoneChecked|| '',
                    sex: sex || '',
                    dob: birthDate || '',
                    os: healthinsurance || ''
                }
            }
            
            await axios.patch(`${node_patient}/update/${uid}`, data, { headers })
                .then(res => {
                    dispatch({ type: 'SET_USER_LOGIN', payload: ['email'] })
                    dispatch({ type: 'USER_FIRST_WS', payload: dataVal.phone })
                    dispatch({ type: 'USER_FIRST_DOB', payload: birthDate })
                    dispatch({ type: 'USER_FIRST_SEX', payload: sex })
                    dispatch({ type: 'USER_FIRST_OS', payload: healthinsurance })
                    dispatch({ type: 'USER_FIRST_DNI', payload: dataVal.dni })
                    dispatch({ type: 'USER_FIRST_FULLNAME', payload: `${dataVal.firstname} ${dataVal.lastname}` })
                    history.push('/signUp/congrats');
                })
        })
    }

    const validationForm = async (dataVal) => {
        let data = {
            dni: dataVal.dni,
        }
        let headers = { ContentType: 'Application/json' }
        const exists = await axios.post(`${node_patient}/checkexists`, data, headers)

        if (exists.data.exists) {
            let text = `El usuario está registrado con el teléfono ${exists.data.ws} `
            if (exists.data.email && exists.data.email !== '') {
                text += ` y el email ${exists.data.email}`
            }
            const registeredAlert = await swal({
                title: `Ya existe un usuario con este documento ¿estás seguro deseas volver a registrarte?`,
                text: `${text}`,
                icon: 'warning',
                buttons: {
                    cancel: 'Si, registrarme',
                    catch: { text: 'No, ingresar con mi usuario', value: true }
                },
                dangerMode: true,
            })
            if (registeredAlert) {
                Firebase.auth().currentUser.delete()
                .then(res => history.push('/'))
            }
        }

        const uid = userActive.currentUser.uid
        if(sex === null) {
            setShowError({...showError, sex: true})  
            return false
        } 
        if(birthDate === '') {
            setShowError({...showError, dob: true})  
            return false
        } 
        if(email !== '' && password !== '') {
            await Firebase.auth().currentUser.sendEmailVerification()
            .then(async () => {
                updatePatient(uid, 'email', dataVal);
            })
            .catch(e => console.error(e))
        } else {
            const providerName = await Firebase.auth().currentUser.providerData[0].providerId
            updatePatient(uid, providerName, dataVal)
        }
    }

    const handleChangeSex = (e) => {
        setActive(true)
        setSex(e.target.value)
        setShowOptions(false)
        setShowError({...showError, sex: false})
    }

    const handleCalendar = (e) => {
        setDate(e)
        const momentDate = moment(e).format('DD-MM-YYYY')
        const olderThan = moment().diff(e, 'years') 
        if(olderThan >= 16) {
            setBirthDate(momentDate)
        }else {
            setShowError({...showError, dob: true})
        }
    }

    return (
        <section className='signUp'>
            <img className='signUp__logo' src={Logo} alt='UMA logo' />
            <section className='signUp__content'>
                {
                    switchContent === '1' && <Stepper complete={1}/>
                }
                {
                    switchContent === '2' && <Stepper complete={2}/>
                }
                <article className='signUp__content__mainText'>
                    <h1 className='title'>¡Te damos la bienvenida a ÜMA!</h1>
                    {switchContent === '1' && 
                    <p className='subtitle'>Para crear tu cuenta, primero necesitamos que nos indiques un mail y una contraseña</p>
                    }
                    {switchContent === '2' && 
                    <p className='subtitle'>Ahora, necesitamos que completes la siguiente información</p> 
                    }
                </article>
                <form className='signUp__content__form'>
                    {switchContent === '1' && 
                    <>
                    {emailExists && <p className='invalidField'>El mail ingresado se encuentra en uso</p>}
                        <GenericInputs 
                            label='¿Cual es tu mail?' 
                            type='email' 
                            name='email'
                            action={(e)=> {setEmail(e.target.value); setEmailExists(false)}}
                            inputRef={
                                register(
                                    { 
                                        required: true, 
                                        pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
                                    }
                                )
                            }
                        />
                        {errors.email && errors.email.type === "required" && <p className='invalidField'>Campo obligatorio</p>}
                        {errors.email && errors.email.type === "pattern" && <p className='invalidField'>Ingrese un mail válido</p>}
                        <GenericInputs 
                            label='Crea una contraseña' 
                            type='password' 
                            name='password'
                            action={(e)=> setPassword(e.target.value)}
                            inputRef={
                                register(
                                    { 
                                        required: true, 
                                        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
                                    }
                                )
                            }
                        />
                        {errors.password && errors.password.type === "required" && <p className='invalidField'>Campo obligatorio</p>}
                        {errors.password && errors.password.type === "pattern" && <p className='invalidField'>La contraseña debe tener un minimo de 8 caracteres y al menos un número</p>}
                        <ConditionButtons check={password}/>
                        <GenericInputs 
                            label='Ingresa nuevamente tu contraseña' 
                            type='password' 
                            name='passrepeat' 
                            inputRef={
                                register(
                                    { 
                                        validate: value => value === password || 'Las contraseñas no coinciden'
                                    }
                                )
                            }
                        />
                        {errors.passrepeat && <p className='invalidField'>{errors.passrepeat.message}</p>}
                    </>
                    }
                    {switchContent === '2' &&
                    <>
                        <GenericInputs
                            label='¿Cual es tu nombre?'
                            type='text' name='firstname' 
                            inputRef={
                                register(
                                    { 
                                        required: true, 
                                        pattern: /^[^\s]{3,}( [^\s]+)?( [^\s]+)?( [^\s]+)?$/ 
                                    }
                                )
                            }
                        />
                        {errors.firstname && errors.firstname.type === "required" && <p className='invalidField'>Campo obligatorio</p>}
                        {errors.firstname && errors.firstname.type === "pattern" && <p className='invalidField'>El formato no es válido</p>}
                        <GenericInputs 
                            label='¿Cual es tu apellido?' 
                            type='text' 
                            name='lastname' 
                            inputRef={
                                register(
                                    { 
                                        required: true, 
                                        pattern: /^[^\s]{3,}( [^\s]+)?( [^\s]+)?( [^\s]+)?$/ 
                                    }
                                )
                            }
                        />
                        {errors.lastname && errors.lastname.type === "required" && <p className='invalidField'>Campo obligatorio</p>}
                        {errors.lastname && errors.lastname.type === "pattern" && <p className='invalidField'>El formato no es válido</p>}
                        <GenericInputs
                            label='Ingresa tu número de identidad' 
                            type='number' 
                            name='dni' 
                            inputRef={
                                register(
                                    { 
                                        required: true, 
                                        minLength: 7
                                    }
                                )
                            } 
                        />
                        {errors.dni && errors.dni.type === "required" && <p className='invalidField'>Campo obligatorio</p>}
                        {errors.dni && errors.dni.type === "minLength" && <p className='invalidField'>El número de identificación debe tener al menos 7 números</p>}
                        <GenericInputs
                            label='Ingresa tu numero de celular'
                            type='number' 
                            name='phone'
                            inputRef={
                                register(
                                    { 
                                        required: true, 
                                        minLength: 10,
                                        maxLenght: 13
                                    }
                                )
                            } 
                        /> 
                        {errors.phone && errors.phone.type === "required" && <p className='invalidField'>Campo obligatorio</p>}
                        {errors.phone && errors.phone.type === "minLength" && <p className='invalidField'>El número de teléfono debe tener al menos 10 números</p>}
                        <GenericInputs 
                            label='¿Cual es tu cobertura de salud?' 
                            type='text' 
                            name='healthinsurance'
                            action={(e)=> setHealthinsurance(e.target.value)}
                        />
                        <div className='container__select--sex'>
                            <button 
                                className={`select--sex ${active ? 'active' : ''}`} 
                                onClick={(e) => {
                                    e.preventDefault();    
                                    setShowOptions(!showOptions);
                                }}
                            >
                                {sex || 'Indica tu sexo'} 
                                <FontAwesomeIcon icon={faChevronDown} />
                            </button>
                            <div className={`show--options ${showOptions ? 'visible' : 'hiden'}`}>
                                <label>
                                    <input type="radio" name="sexo" value="Femenino" 
                                    onChange={handleChangeSex} 
                                    />
                                    Femenino
                                </label>
                                <label>
                                    <input type="radio" name="sexo" value="Masculino" 
                                    onChange={handleChangeSex}
                                     />
                                    Masculino
                                </label>
                                <label>
                                    <input type="radio" name="sexo" value="Otro" 
                                    onChange={handleChangeSex} 
                                    />
                                    Otro
                                </label>
                            </div>
                        </div>
                        {showError.sex && <p className='invalidField'>Campo obligatorio</p>}
                        {showCalendar && 
                        <section className='calendar__container'>
                            <Modal>
                            <Calendar
                                date={date}
                                maxDate={new Date('12-29-2021')}
                                onChange={(e)=> handleCalendar(e)}
                                locale={es}
                            />
                                <section className='calendar__actions'>
                                    <button onClick={()=> setShowCalendar(()=>setShowCalendar(false))} className='calendar__actions-btn cancel'>Cancelar</button>
                                    <button className='calendar__actions-btn done' onClick={(e)=> {e.preventDefault(); setShowCalendar(false)}}>Hecho</button>
                                    <button onClick={()=>setShowCalendar(false)} className='calendar__actions-btn-close'>x</button>
                                </section>
                            </Modal>
                        </section>
                        }
                        <section className='birth__date' onClick={()=>setShowCalendar(true)}  >
                            {birthDate !== '' ? <p className='text date'>{birthDate}</p> : <p className='text'>Selecciona tu fecha de nacimiento</p>}
                            <img src={CalendarIcon} alt='Icono de calendario' className='icon--calendar' />
                        </section>
                        {showError.dob && <p className='invalidField'>Debes ser mayor de 16 años para utilizar la aplicación</p>}
                    </> 
                    }
                </form>
                <section className='signUp__actions'>
                    {switchContent === '1' &&
                    <>
                        <button className='signUp__actions--button back' onClick={()=> history.push('/signup')}>
                            Atrás
                        </button>
                        <button className='signUp__actions--button foward' onClick={handleSubmit(handleCreateUser)}>
                            Siguiente
                        </button>
                    </>
                    }
                    {switchContent === '2' && 
                    <>
                        <GenericButton action={handleSubmit(validationForm)}>Registrarme</GenericButton>
                        <p className='terms-and-conditions'>
                            Al registrarte estás aceptando los
                            <a onClick={()=>history.push('/termsconditions')}> términos y condiciones</a>
                        </p>
                    </>
                    }
                </section>
            </section>
        </section>
    )
} 

export default Register;
