import React, { useState } from 'react';
import BackButton from '../../../GeneralComponents/Backbutton';
import { GoogleButton, FacebookButton, MicrosoftButton, EmailButton } from '../GenericComponents';
import '../../../../styles/user/forgottenPass/forgottenPass.scss';

const ForgottenAccError = () => {
    // const [typeError, setTypeError] = useState(false)
    // true DNI, false telefono

    return (
       <section className='needHelp'>
           <BackButton inlineButton customTarget={`/login/phone`}/>
           <article className='needHelp__forgottenPass'>
               <h1 className='title'>Lo sentimos</h1>
                <p className='subtitle'>No hemos encontrado ninguna cuenta asociada a esos datos.</p>
               {/* <p className='subtitle'>No hemos encontrado ninguna cuenta {typeError ? 'con ese DNI.' : 'asociada a ese celular.'}</p>  */}
               <p className='subtitle'>¿Deseas crear una cuenta?</p>
           </article>
            <section className="login__buttonGroup column">
                <GoogleButton signUp />
                <FacebookButton signUp />
                <MicrosoftButton signUp />
                <EmailButton signUp />
            </section>
       </section>
    )
}

export default ForgottenAccError;
