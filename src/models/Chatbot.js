import React from 'react'
import Query from '../components/Query/QueryContainer'
import Message from '../components/Query/Message'

export class Chatbot {
    constructor(steps, data = {}) {
        this.components = { Message, Query };
        this.complete = false
        this.data = data
        this.done = false
        this.tags = ''
        this.saveQuery = (val, id, nextStep) => {
            this.complete = true
            this.tags = `${this.data.domain}`
            return nextStep
        }

        this.triggerSaveData = (val, id, nextStep) => {
            this.data[id] = val.value
            return nextStep
        }

        this.setTags = (tag) => {
            if (data['tags']) data['tags'] = data['tags'] + '. ' + tag
            else data['tags'] = tag
        }

        this.ageParams = (val) => {
            if (isNaN(val)) {
                return 'En numeros por favor';
            } else if (val < 0) {
                return 'El valor tiene que ser positivo';
            } else if (val > 120) {
                return `${val}?! Dale, enserio?!?!`;
            }

            return true;
        }

        this.heightValidator = (val) => {
            if (isNaN(val)) {
                return 'En numeros por favor';
            } else if (val < 0) {
                return 'El valor tiene que ser positivo';
            }

            return true;
        }

        this.weightValidator = (val) => {
            if (isNaN(val)) {
                return 'En numeros por favor';
            } else if (val < 0) {
                return 'El valor tiene que ser positivo';
            }

            return true;
        }

        this.steps = steps.map((step, index) => {
            if (index == steps.length - 1) {
                this.done = true
            }
            if (step.options && step.options instanceof Array) {
                step.options = step.options.map(option => {
                    if (option.trigger && option.trigger.method) {
                        let method = option.trigger.method
                        let params = option.trigger.params
                        let nextStep = option.trigger.nextStep
                        let value = option.trigger.value || null
                        option['trigger'] = (val) => {
                            if (value !== null) val = value
                            return this[method](val, params, nextStep)
                        }
                    }
                    return option
                })
                return step
            }
            if (step.validator && typeof (step.validator) === 'string') {
                let method = step['validator']
                console.log(method)
                step['validator'] = (val) => this[method](val)
            }
            if (step.metadata) {
                if (step['metadata'].query) {
                    step.metadata = step.metadata
                } else {
                    let key = step['metadata']
                    step['metadata'] = this[key]
                }
            }
            if (step.component && typeof (step.component) === 'string') {
                //console.log(step)
                if (step.component.indexOf('@') > -1) {
                    let component = step['component'].substring(
                        step['component'].lastIndexOf("@"),
                        step['component'].lastIndexOf("#") + 1
                    )
                    let params = step['component'].split('@')[1]
                    const ChatComponent = this.components[component]
                    //console.log(ChatComponent)
                    step['component'] = <ChatComponent params={params} data={this.data}></ChatComponent>
                }
                else {
                    const ChatComponent = this.components[step['component']]
                    //console.log(ChatComponent)
                    step['component'] = <ChatComponent data={this.data}></ChatComponent>
                }
            }
            if (step.trigger && step.trigger.method) {
                let method = step.trigger.method
                let params = step.trigger.params
                let nextStep = step.trigger.nextStep
                let value = step.trigger.value || null
                step['trigger'] = (val) => {
                    if (value !== null) val = value
                    return this[method](val, params, nextStep)
                }
            }
            return step
        });
    }
}

export const jsonChat = [
    {
        "id": "0",
        "message": "Hola, soy ??MA! ??C??mo te sientes hoy?",
        "trigger": "estado"
    },
    {
        "id": "estado",
        "options": [
            {
                "value": "me siento bien",
                "label": "me siento bien",
                "trigger": "1"
            },
            {
                "value": "no tan bien",
                "label": "no tan bien",
                "trigger": "2"
            },
            {
                "value": "mal",
                "label": "mal",
                "trigger": "3"
            }
        ]
    },
    {
        "id": "1",
        "message": "Que genial que te sientas bien, de igual manera mi objetivo es ayudarte a encontrar el profesional m??s adecuado para ti, para que pueda trabajar contigo y ayudarte a superar aquello que te preocupa",
        "trigger": "optionsgenial"
    },
    {
        "id": "optionsgenial",
        "options": [
            {
                "value": "genial",
                "label": "Genial, gracias UMA quiero mas informacion de c??mo vas a ayudarme",
                "trigger": "informacion"
            }
        ]
    },
    {
        "id": "2",
        "message": "Mi objetivo es ayudarte a sentirte mejor con un profesional que sea el mas adecuado para ti, para que pueda trabajar contigo y ayudarte a  superar aquello que te preocupa",
        "trigger": "optionsdeacuerdo"
    },
    {
        "id": "optionsdeacuerdo",
        "options": [
            {
                "value": "deacuerdo",
                "label": "De acuerdo, gracias UMA quiero mas informacion de c??mo vas a ayudarme",
                "trigger": "informacion"
            }
        ]
    },
    {
        "id": "3",
        "message": "Puedes contar conmigo... Mi objetivo es ayudarte a encontrar el profesional m??s adecuado para ti, para que pueda trabajar contigo y ayudarte a superar aquello que te preocupa",
        "trigger": "optionsgracias"
    },
    {
        "id": "optionsgracias",
        "options": [
            {
                "value": "gracias",
                "label": "gracias UMA quiero mas informacion de c??mo vas a ayudarme",
                "trigger": "informacion"
            }
        ]
    },
    {
        "id": "informacion",
        "message": "Es un placer para mi poder ayudarte, te explicar?? c??mo funciona ??MA y  en caso de que te interese unirte al servicio, te har?? una serie de preguntas que me permitir??n asignarte al especialista m??s adecuado para ti.",
        "trigger": "optionssi"
    },
    {
        "id": "optionssi",
        "options": [
            {
                "value": "si",
                "label": "Si. ??Adelante!",
                "trigger": "asknombre"
            }
        ]
    },
    {
        "id": "asknombre",
        "message": "Como te llamas?",
        "trigger": "nombre"
    },
    {
        "id": "nombre",
        "user": true,
        "trigger": {
            method: "triggerSaveData",
            params: "nombre",
            nextStep: "lindo"
        }
    },
    {
        "id": "lindo",
        "message": "Que lindo nombre {previousValue}!",
        "trigger": "optionsnombre"
    },
    {
        "id": "optionsnombre",
        "options": [
            {
                "value": "gracias",
                "label": "Gracias!",
                "trigger": "genero"
            }
        ],
    },
    {
        "id": "genero",
        "message": "??Puedes contarnos con qu??  g??nero te sientes m??s identificado?",
        "trigger": "optionsgenero"
    },
    {
        "id": "optionsgenero",
        "options": [
            {
                "value": "mujer",
                "label": "Mujer",
                "trigger": {
                    method: "triggerSaveData",
                    params: "genero",
                    value: "F",
                    nextStep: "askedad"
                }
            },
            {
                "value": "hombre",
                "label": "Hombre",
                "trigger": {
                    method: "triggerSaveData",
                    params: "genero",
                    value: "M",
                    nextStep: "askedad"
                }
            },
            {
                "value": "otro",
                "label": "Otro",
                "trigger": {
                    method: "triggerSaveData",
                    params: "genero",
                    value: "OTHER",
                    nextStep: "askedad"
                }
            }
        ]
    },
    {
        "id": "askedad",
        "message": "Cuantos a??os tienes?",
        "trigger": "edad"
    },
    {
        "id": "edad",
        "user": true,
        "trigger": {
            method: "triggerSaveData",
            params: "edad",
            nextStep: "tipoproblema"
        }
    },
    {
        "id": "tipoproblema",
        "message": "Para poder ayudarte quisiera que me indiques qu?? ??rea te gustar??a que trabajemos",
        "trigger": "t1"
    },
    {
        "id": "t1",
        "message": "Por favor selecciona una de las siguientes opciones",
        "trigger": "t1optiones"
    },
    {
        id: 't1',
        message: 'Por favor selecciona una de las siguientes opciones',
        trigger: 't1optiones'
    },
    {
        id: 't1optiones',
        options: [{
            value: 'pareja',
            label: 'Pareja',
            trigger: 'parejaid'
        },
        {
            value: 'sexualidad',
            label: 'Sexualidad',
            trigger: 'Sexualidadid'
        },
        {
            value: 'social/familiar',
            label: 'Social / Familiar',
            trigger: 'social/familiarid'
        },
        {
            value: 'desarrollolaboral/profesional/academico',
            label: 'Desarrollo laboral / Profesional / Acad??mico',
            trigger: 'dpaid'
        },
        {
            value: 'autoestima/desarrollopersonal',
            label: 'Autoestima / Desarrollo Personal',
            trigger: 'adid'
        },
        {
            value: 'depresion/duelo',
            label: 'Depresion / Duelo',
            trigger: 'ddid'
        },
        {
            value: 'ansiedad/estres/ataquedepanico',
            label: 'Ansiedad / Estr??s / Ataque de p??nico',
            trigger: 'aeaid'
        },
        {
            value: 'adicciones',
            label: 'Adicciones',
            trigger: 'adiccionesid'
        },
        {
            value: 'coaching',
            label: 'Coaching',
            trigger: 'coachingid'
        }
        ]
    },
    {
        "id": "parejaid",
        "delay": 1500,
        "asMessage": true,
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Esta bien ${nombre}. Es posible que est??s aqu?? porque tu relaci??n est?? atravesando una crisis, se ha roto o te resulta muy dif??cil encontrar una pareja. En cualquier caso, podemos acompa??arte para que puedas enfocar bien tus objetivos. En ??MA podemos ayudarte gracias a profesionales expertos en temas de pareja, podr??s trabajar sobre lo que te preocupa y sentirte mejor",
        "trigger": "p1"
    },
    {
        "id": "p1",
        "message": "Antes de seguir. ??Acudir??s s??lo o en pareja?",
        "trigger": "p1options"
    },
    {
        "id": "p1options",
        "options": [
            {
                "value": "pareja",
                "label": "pareja",
                "trigger": {
                    method: "triggerSaveData",
                    params: "domain",
                    value: "coaching",
                    nextStep: "p2"
                }
            },
            {
                "value": "solo",
                "label": "solo",
                "trigger": {
                    method: "triggerSaveData",
                    params: "domain",
                    value: "coaching",
                    nextStep: "p2"
                }
            }
        ]
    },
    {
        "id": "p2",
        "message": "Con cu??les de estas situaciones te sientes m??s identificado ? Dificultades en: ",
        "trigger": "p2options"
    },
    {
        "id": "p2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {
                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["Comunicaci??n", "Infidelidad", "Sexualidad", "Convivencia"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'p3'
        }
    },
    {
        "id": "p3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ??Te gustar??a que te cuente c??mo funcionamos?",
        "trigger": "p3options"
    },
    {
        "id": "p3options",
        "options": [
            {
                "value": "claro!",
                "label": "claro!",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "Sexualidadid",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Esta bien, ${nombre} los problemas de tipo sexual son mucho m??s comunes de lo que crees, pero en ocasiones se siente demasiado pudor, para dar el paso y pedir ayuda con las estrategias adecuadas, podr??s disfrutar de la sexualidad plenamente.",
        "trigger": "s1"
    },
    {
        "id": "s1",
        "message": "En UMA, gracias a profesionales expertos en sexolog??a, podr??s trabajar sobre lo que te preocupa y sentirte mejor",
        "trigger": "s2"
    },
    {
        "id": "s2",
        "message": "Cuales de estas situaciones te sientes m??s identificado ? Dificultades en: ",
        "trigger": "s2optiones"
    },
    {
        "id": "s2optiones",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {
                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["Impotencia", "Falta del deseo sexual", "Dificultad Org??smica", "Otro"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'f3'
        }
    },
    {
        "id": "s3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ??Quieres que te cuente c??mo funcionamos?",
        "trigger": "s3options"
    },
    {
        "id": "s3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "social/familiarid",
        "message": "Esta bien, ${nombre} Suelen surgir conflictos con nuestros amigos y familiares.",
        "trigger": "f1"
    },
    {
        "id": "f1",
        "message": "En UMA, gracias a profesionales expertos en temas socio-familiares, podr??s trabajar sobre lo que te preocupa y sentirte mejor.",
        "trigger": "f2"
    },
    {
        "id": "f2",
        "message": "Cuales de estas situaciones te sientes m??s identificado ? Dificultades con: ",
        "trigger": "f2options"
    },
    {
        "id": "f2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {

                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["Familia", "Amigos", "Entorno", "Otro"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'f3'
        }
    },
    {
        "id": "f3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ?? Quieres que te cuento c??mo funcionamos?",
        "trigger": "f3options"
    },
    {
        "id": "f3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "dpaid",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Es normal, ${nombre} que en ocasiones el ritmo de trabajo, la falta de ??l, las relaciones con los compan??eros o la sensaci??n no saber cu??l es tu camino, generen desmotivaci??n o ansiedad",
        "trigger": "dp1"
    },
    {
        "id": "dp1",
        "message": "En UMA, gracias a profesionales expertos en temas laborales y acad??micos, podr??s trabajar sobre lo que te preocupa y sentirte mejor",
        "trigger": "dp2"
    },
    {
        "id": "dp2",
        "message": "Cuales de estas situaciones te sientes m??s identificado ? Dificultades con: ",
        "trigger": "dp2options"
    },
    {
        "id": "dp2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {

                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["Orientaci??n vocacional", "Psicot??cnico", "Reinserci??n laboral", "Coaching", "Acoso laboral", "Estr??s laboral", "otro"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'dp3'
        }
    },
    {
        "id": "dp3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ?? Quieres que te cuento c??mo funcionamos?",
        "trigger": "dp3options"
    },
    {
        "id": "dp3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "adid",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Esta bien, ${nombre} El paso principal para alcanzar tu mejor versi??n es conocerte y aceptarte. Potenciar tus fortalezas y trabajar tus defectos, te har?? ganar en seguridad y en bienestar",
        "trigger": "ad1"
    },
    {
        "id": "ad1",
        "message": "En UMA, gracias a profesionales expertos en desarrollo personal, podr??s trabajar sobre lo que te preocupa y sentirte mejor.",
        "trigger": "ad2"
    },
    {
        "id": "ad2",
        "message": "Qu?? te gustar??a trabajar de t?? mismo ?",
        "trigger": "ad2options",
    },
    {
        "id": "ad2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {

                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["Habilidades Sociales", "Inteligencia Emocional", "Autoestima", "Liderazgo", "Otro"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'ad3'
        }
    },
    {
        "id": "ad3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ?? Quieres que te cuento c??mo funcionamos?",
        "trigger": "ad3options"
    },
    {
        "id": "ad3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "ddid",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Lo siento mucho, ${nombre} toda p??rdida o dificultad que se nos presenta implica un gran cambio en nosotros. Adaptarse a la nueva situaci??n y gestionar los sentimientos que aparecen no es sencillo",
        "trigger": "dd1"
    },
    {
        "id": "dd1",
        "message": "En UMA, gracias a profesionales expertos en procesos de duelo y depresi??n, podr??s trabajar sobre lo que te preocupa y sentirte mejor.",
        "trigger": "dd2"
    },
    {
        "id": "dd2",
        "message": "Con cu??l de estas sensaciones te sientes m??s identificado ?",
        "trigger": "dd2options"
    },
    {
        "id": "dd2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {

                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["P??rdida", "Tristeza", "Miedo", "Sensaci??n de duelo", "Depresi??n", "Otro"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'dd3'
        }
    },
    {
        "id": "dd3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ?? Quieres que te cuento c??mo funcionamos?",
        "trigger": "dd3options"
    },
    {
        "id": "dd3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "aeaid",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Te entiendo, ${nombre} La ansiedad y el estr??s lleva consigo una serie de s??ntomas que generan miedo y mucho malestar, pero debes saber que conociendo las herramientas adecuadas podr??s conseguir mantener el control",
        "trigger": "ae1"
    },
    {
        "id": "ae1",
        "message": "En ??MA, gracias a profesionales expertos en ansiedad, podr??s trabajar sobre lo que te preocupa y sentirte mejor",
        "trigger": "ae2"
    },
    {
        "id": "ae2",
        "message": "Con cu??l de estas sensaciones te sientes m??s identificado ?",
        "trigger": "ae2options"
    },
    {
        "id": "ae2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {

                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["Nerviosismo, agitaci??n o tensi??n", "Peligro inminente, p??nico o cat??strofe", "Aumento del ritmo card??aco", "Respiraci??n acelerada (hiperventilaci??n)", "Sudaraci??n", "Temblores", "Sensaci??n de debilidad o cansancio", "Otro"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'ae3'
        }
    },
    {
        "id": "ae3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ?? Quieres que te cuento c??mo funcionamos?",
        "trigger": "ae3options"
    },
    {
        "id": "ae3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "final",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre},  Te cuento como seguiremos : Te brindaremos una lista de profesionales para que puedas pedir un turno con nuestros profesionales",
        "trigger": "finalQ"
    },
    {
        "id": "finalQ",
        "options": [
            {
                "value": "meparecebien",
                "label": "Me parece bien",
                "trigger": {
                    method: 'saveQuery',
                    params: 'data',
                    nextStep: 'end'
                },

            },
            {
                "value": "loseguirepensando",
                "label": "Lo seguir?? pensando",
                "trigger": "end"
            }
        ]
    },
    {
        "id": "end",
        "message": "genial!",
        "end": true,
    },
    {
        "id": "adiccionesid",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Te entiendo, ${nombre}. Las adicciones son dif??ciles de atravesar sin un apoyo de un profesional.",
        "trigger": "adi1"
    },
    {
        "id": "adi1",
        "message": "En ??MA, gracias a profesionales expertos en adicciones, podr??s trabajar sobre lo que te preocupa y sentirte mejor",
        "trigger": "adi2"
    },
    {
        "id": "adi2",
        "message": "??Qu?? tipo de adicci??n te gustar??a tratar con el especialista? ",
        "trigger": "adi2options"
    },
    {
        "id": "adi2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {

                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ['Ciberadicci??n', 'Alcoholismo', 'Adicci??n', 'Drogadicci??n', 'Tabaquismo', 'Ludopat??a', 'Otro'],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'adi3'
        }
    },
    {
        "id": "adi3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ?? Quieres que te cuento c??mo funcionamos?",
        "trigger": "adi3options"
    },
    {
        "id": "adi3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    },
    {
        "id": "coachingid",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@${nombre}. quiero contarte primero qu?? es el Coaching . La palabra Coaching  procede del verbo ingl??s to coach ??entrenar??, es un m??todo que consiste en acompa??ar, instruir o entrenar a una persona o a un grupo de ellas, con el objetivo de conseguir cumplir metas o desarrollar habilidades espec??ficas.",
        "trigger": "coa1"
    },
    {
        "id": "coa1",
        "message": "En ??MA, gracias a profesionales expertos en Coaching, podr??s trabajar sobre lo que te preocupa y sentirte mejor",
        "trigger": "coa2"
    },
    {
        "id": "coa2",
        "message": "Descubriendo los beneficios del Coaching: ??Qu?? aspectos de tu vida crees que te gustar??a trabajar?",
        "trigger": "coa2options"
    },
    {
        "id": "coa2options",
        "hideInput": true,
        "replace": true,
        "component": 'Query',
        "waitAction": true,
        "metadata": {
            "query": {

                "style": {
                },
                "outputs": {
                    "style": {},
                    "outputs": [
                    ]
                },
                "inputs": {
                    "style": "col-6",
                    "inputs": [
                        {
                            "type": "search",
                            "style": {},
                            "options": {
                                "items": ["Ayudar a definir objetivos", "M??s creatividad", "Mayor flexibilidad y adaptabilidad al cambio", "Mejora de las relaciones", "Empoderamiento", "Reducir el estr??s y ayuda para gestionar el tiempo", "Motivaci??n", "Bienestar", "Otro"],
                                "option_id": "firebase id for this option",
                                "styles": {}
                            }
                        }
                    ]
                }
            }
        },
        "trigger": {
            method: 'triggerSaveData',
            params: 'domain',
            nextStep: 'coa3'
        }
    },
    {
        "id": "coa3",
        "delay": 1500,
        "asMessage": true,
        "component": "#Message@Gracias ${nombre}, ?? Quieres que te cuento c??mo funcionamos?",
        "trigger": "coa3options"
    },
    {
        "id": "coa3options",
        "options": [
            {
                "value": "claro",
                "label": "Claro",
                "trigger": "final"
            }
        ]
    }
]

// este es el flujo de nutricion
export const jsonChatNutri = [{
  "id": "0",
  "message": "Hola, soy ??MA! tu asistente nutricional!",
  "trigger": "holaUma"
},
{
  "id": "holaUma",
  "options": [
    {
      "value": "Hola ??MA!",
      "label": "Hola ??MA!",
      "trigger": "start"
    }
  ]
},
{
  "id": "start",
  "message": "El primer paso en nuestro viaje es encontrar el profesional adecuado para ti.",
  "trigger": "start_1"
},
{
  "id": "start_1",
  "delay": 1500,
  "message": "Para ello voy a hacerte unas preguntas, solo tomara unos minutos",
  "trigger": "start_accept"
},
{
  "id": "start_accept",
  "options": [
    {
      "value": "Ok!",
      "label": "Ok!",
      "trigger": "ask_height"
    },
    {
      "value": "Adelante!",
      "label": "Adelante!",
      "trigger": "ask_height"
    }
  ]
},
{
  "id": "ask_height",
  "delay": 2000,
  "message": "Cu??l es tu estatura?",
  "trigger": "ask_height_response"
},
{
  "id": "ask_height_response",
  "user": true,
  "validator": "heightValidator",
  "placeholder": 'en centimetros por favor!',
  "trigger": {
    method: 'triggerSaveData',
    params: 'height',
    nextStep: 'ask_weight'
  }
},
{
  "id": "ask_weight",
  "delay": 1500,
  "message": "Cu??l es tu peso?",
  "trigger": "ask_weight_response"
},
{
  "id": "ask_weight_response",
  "user": true,
  "placeholder": 'en kilos por favor!',
  "validator": "weightValidator",
  "trigger": {
    method: 'triggerSaveData',
    params: 'weight',
    nextStep: 'question_1'
  }
},
{
  "id": "question_1",
  "delay": 2500,
  "message": "C??mo describirias tu nivel de actividad fisica?",
  "trigger": "question_1_options"
},
{
  "id": "question_1_options",
  "options": [
    {
      "value": "Sedentario",
      "label": "Sedentario",
      "trigger": {
        method: 'triggerSaveData',
        params: 'actividadNivel',
        value: true,
        nextStep: 'question_2'
      }
    },
    {
      "value": "Moderado",
      "label": "Moderado",
      "trigger": {
        method: 'triggerSaveData',
        params: 'actividadNivel',
        value: true,
        nextStep: 'question_2'
      }
    },
    {
      "value": "Activo",
      "label": "Activo",
      "trigger": {
        method: 'triggerSaveData',
        params: 'actividadNivel',
        value: true,
        nextStep: 'question_2'
      }
    },
    {
      "value": "Atleta",
      "label": "Atleta",
      "trigger": {
        method: 'triggerSaveData',
        params: 'actividadNivel',
        value: true,
        nextStep: 'question_2'
      }
    }
  ]
},
{
  "id": "question_2",
  "delay": 1500,
  "message": "Cu??l es tu objetivo?",
  "trigger": "question_2_options"
},
{
  "id": "question_2_options",
  "options": [
    {
      "value": "Quemar grasa",
      "label": "Quemar grasa",
      "trigger": {
        method: 'triggerSaveData',
        params: 'objetivo',
        value: 'Quemar grasa',
        nextStep: 'question_3'
      }
    },
    {
      "value": "Mantener peso",
      "label": "Mantener peso",
      "trigger": {
        method: 'triggerSaveData',
        params: 'objetivo',
        value: 'Mantener peso',
        nextStep: 'question_3'
      }
    },
    {
      "value": "Ganar m??sculo",
      "label": "Ganar m??sculo",
      "trigger": {
        method: 'triggerSaveData',
        params: 'objetivo',
        value: 'Ganar m??sculo',
        nextStep: 'question_3'
      }
    },
    {
      "value": "Cambiar mi dieta",
      "label": "Cambiar mi dieta",
      "trigger": {
        method: 'triggerSaveData',
        params: 'objetivo',
        value: 'Cambiar mi dieta',
        nextStep: 'question_3'
      }
    }
  ]
},
{
  "id": "question_3",
  "delay": 1500,
  "message": "Tienes alg??n diagnostico previo?",
  "trigger": "question_3_options"
},
{
  "id": "question_3_options",
  "options": [
    {
      "value": "si",
      "label": "si",
      "trigger": "question_3_which_condition"
    },
    {
      "value": "no",
      "label": "no",
      "trigger": {
        method: 'triggerSaveData',
        params: 'antecedente',
        value: false,
        nextStep: 'question_4'
      }
    }
  ]
},
{
    "id": "question_3_which_condition",
    "hideInput": true,
    "replace": true,
    "waitAction": true,
    "delay": 2500,
    "hideInput": true,
    "component": "Query",
    "metadata": {
      "query": {
        "style": {
        },
        "outputs": {
          "style": {},
          "outputs": [
            {
              "type": "text",
              "style": {},
              "options": {
                "text": "Cual?",
                "option_id": "firebase id for this option",
                "styles": {}
              }
            }
          ]
        },
        "inputs": {
          "style": "col-6",
          "inputs": [
            {
              "type": "search",
              "style": {},
              "options": {
                "items": ['diabetes', 'hipertension', 'celiaquia', 'gastritis', 'enfermedad inflamatoria intestinal'],
                "option_id": "firebase id for this option",
                "style": {
                  background: '#b0e4f1',
                  border: 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'helvetica',
                  textTransform: 'capitalize',
                  fontSize: '0.8rem'
                }
              }
            }
          ]
        }
      }
    },
    "trigger": {
      method: 'triggerSaveData',
      params: 'diagnostico',
      nextStep: 'question_3_another'
    }
  },
  {
    "id": "question_3_another",
    "delay": 1500,
    "message": "Tienes alg??n otro diagnostico previo?",
    "trigger": "question_3_another_options"
  },
  {
    "id": "question_3_another_options",
    "options": [
      {
        "value": "si",
        "label": "si",
        "trigger": "question_3_which_condition"
      },
      {
        "value": "no",
        "label": "no",
        "trigger": 'question_4'
      }
    ]
  },
  {
      "id": "question_4",
      "delay": 1500,
      "message": "Sigues alguna dieta?",
      "trigger": "question_4_options"
    },
    {
      "id": "question_4_options",
      "options": [
        {
          "value": "si",
          "label": "si",
          "trigger": "question_4_which_diet_input"
        },
        {
          "value": "no",
          "label": "no",
          "trigger": {
            method: 'triggerSaveData',
            params: 'diet',
            value: false,
            nextStep: 'question_5'
          }
        }
      ]
    },
    {
      "id": "question_4_which_diet_input",
      "hideInput": true,
      "replace": true,
      "component": 'Query',
      "waitAction": true,
      "metadata": {
        "query": {
    
          "style": {
          },
          "outputs": {
            "style": {},
            "outputs": [
            ]
          },
          "inputs": {
            "style": "col-6",
            "inputs": [
              {
                "type": "search",
                "style": {},
                "options": {
                  "items": ['vegano', 'vegetariano', 'paleolitica', 'gerentologia', 'otro plan de dieta'],
                  "option_id": "firebase id for this option",
                  "styles": {}
                }
              }
            ]
          }
        }
      },
      "trigger": {
        method: 'triggerSaveData',
        params: 'medicacion',
        nextStep: 'fin'
      }
    },
    {
      "id": "fin",
      "delay": 1500,
      "message": "Gracias por responder mis preguntas!",
      "trigger": "fin2"
    },
    {
      "id": "fin2",
      "delay": 1500,
      "message": "a continuacion, te dirigire a nuestro listado de especialistas",
      "trigger": "fin2options"
    },
    {
      "id": "fin2options",
      "options": [
        {
          "value": "Gracias ??MA!",
          "label": "Gracias ??MA!",
          "trigger": "question_3_which_condition"
        }
      ]
    },
]

export const jsonChatPSICOGABI = [{
  "id": "0",
  "message": "Hola, soy ??MA!",
  "trigger": "holaUma"
},
{
  "id": "holaUma",
  "options": [
    {
      "value": "Hola ??MA",
      "label": "Hola ??MA",
      "trigger": "nombreUser"
    }
  ]
},
{
  "id": "nombreUser",
  "message": "Como te llamas?",
  "trigger": "nombre"
},
{
  "id": "nombre",
  "user": true,
  "trigger": {
    method: 'triggerSaveData',
    params: 'nombre',
    nextStep: 'lindo'
  }
},
{
  "id": "lindo",
  "message": "{previousValue}! Que lindo nombre!",
  "trigger": "edadUser"
},
{
  "id": "edadUser",
  "message": "Cuantos a??os tienes?",
  "trigger": "edad"
},
{
  "id": "edad",
  "user": true,
  validator: "ageParams",
  "trigger": {
    method: 'triggerSaveData',
    params: 'edad',
    nextStep: 'presentacion'
  },
  "metadata": 'data'
},
{
  "id": "presentacion",
  "asMessage": true,
  "component": "#Message@Entonces ${nombre}, Soy UMA tu asistente emocional. Periodicamente te preguntare sobre tu estado de animo, y claro esta,siempre que me necesites, estoy a un click de distancia!",
  "trigger": "aceptarPresentacion"
},
{
  "id": "presentacionBot",
  "delay": 2000,
  "message": "No soy un humano, pero de alguna forma si lo soy!",
  "trigger": "presentacionProf"
},
{
  "id": "aceptarPresentacion",
  "options": [
    {
      "value": "Ok...",
      "label": "Ok...",
      "trigger": "presentacionBot"
    },
    {
      "value": "Genial",
      "label": "Genial",
      "trigger": "presentacionBot"
    }
  ]
},
{
  "id": "presentacionProf",
  "delay": 4000,
  "message": "El primer paso en nuestro viaje es encontrar el profesional mas adecuado para ti",
  "trigger": "aceptarViaje"
},
{
  "id": "aceptarViaje",
  "options": [
    {
      "value": "Ok!",
      "label": "Ok!",
      "trigger": "presentacionPreguntas"
    }
  ]
},
{
  "id": "presentacionPreguntas",
  "delay": 2000,
  "message": "Pero ahora bien, Hablemos de ti. te voy a hacer unas preguntas solo tomara 3 minutos.",
  "trigger": "question_1"
},
{
  "id": "question_1",
  "delay": 2500,
  "message": "actualmente estas haciendo terapia con un profesional?",
  "trigger": "question_1_options"
},
{
  "id": "question_1_options",
  "options": [
    {
      "value": "si",
      "label": "si",
      "trigger": {
        method: 'triggerSaveData',
        params: 'terapia',
        value: true,
        nextStep: 'question_2'
      }
    },
    {
      "value": "no",
      "label": "no",
      "trigger": {
        method: 'triggerSaveData',
        params: 'terapia',
        value: false,
        nextStep: 'question_2'
      }
    }
  ]
},
{
  "id": "question_2",
  "delay": 1500,
  "message": "actualmente tienes alguna condicion mental diagnosticada por un profesional?",
  "trigger": "question_2_options"
},
{
  "id": "question_2_options",
  "options": [
    {
      "value": "si",
      "label": "si",
      "trigger": "question_2_which_condition"
    },
    {
      "value": "no",
      "label": "no",
      "trigger": {
        method: 'triggerSaveData',
        params: 'terapia',
        value: false,
        nextStep: 'question_3'
      }
    }
  ]
},
{
  "id": "question_2_which_condition",
  "hideInput": true,
  "replace": true,
  "waitAction": true,
  "delay": 2500,
  "hideInput": true,
  "component": "Query",
  "metadata": {
    "query": {
      "style": {
      },
      "outputs": {
        "style": {},
        "outputs": [
          {
            "type": "text",
            "style": {},
            "options": {
              "text": "Cual?",
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      },
      "inputs": {
        "style": "col-6",
        "inputs": [
          {
            "type": "search",
            "style": {},
            "options": {
              "items": ['depresion', 'ansiedad', 'agorafobia', 'psicosis', 'adiccion'],
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      }
    }
  },
  "trigger": {
    method: 'triggerSaveData',
    params: 'diagnostico',
    nextStep: 'question_3'
  }
},
{
  "id": "question_3",
  "delay": 1500,
  "asMessage": true,
  "component": "#Message@Alguna vez fuiste diagnosticado con una condicion mental por un profesional?",
  "trigger": "question_3_options"
},
{
  "id": "question_3_options",
  "options": [
    {
      "value": "si",
      "label": "si",
      "trigger": "question_3_which_condition"
    },
    {
      "value": "no",
      "label": "no",
      "trigger": {
        method: 'triggerSaveData',
        params: 'antecedente',
        value: 'false',
        nextStep: 'question_4'
      }
    }
  ]
},
{
  "id": "question_3_which_condition",
  "delay": 1500,
  "message": "Cual?",
  "trigger": "question_3_which_condition_input"
},
{
  "id": "question_3_which_condition_input",
  "hideInput": true,
  "replace": true,
  "component": 'Query',
  "waitAction": true,
  "metadata": {
    "query": {

      "style": {
      },
      "outputs": {
        "style": {},
        "outputs": [
        ]
      },
      "inputs": {
        "style": "col-6",
        "inputs": [
          {
            "type": "search",
            "style": {},
            "options": {
              "items": ['depresion', 'ansiedad', 'agorafobia', 'psicosis', 'adiccion'],
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      }
    }
  },
  "trigger": {
    method: 'triggerSaveData',
    params: 'antecedente',
    nextStep: 'question_4'
  }
},
{
  "id": "question_4",
  "delay": 1500,
  "asMessage": true,
  "component": "#Message@Estas tomando algun tipo de medicacion para una condicion mental?",
  "trigger": "question_4_options"
},
{
  "id": "question_4_options",
  "options": [
    {
      "value": "si",
      "label": "si",
      "trigger": "question_4_which_medication_input"
    },
    {
      "value": "no",
      "label": "no",
      "trigger": {
        method: 'triggerSaveData',
        params: 'medicacion',
        nextStep: 'question_5'
      }
    }
  ]
},
{
  "id": "question_4_which_medication_input",
  "hideInput": true,
  "replace": true,
  "component": 'Query',
  "waitAction": true,
  "metadata": {
    "query": {

      "style": {
      },
      "outputs": {
        "style": {},
        "outputs": [
        ]
      },
      "inputs": {
        "style": "col-6",
        "inputs": [
          {
            "type": "search",
            "style": {},
            "options": {
              "items": ['clonazepam', 'rivotril', 'prozac', 'lexapro'],
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      }
    }
  },
  "trigger": {
    method: 'triggerSaveData',
    params: 'medicacion',
    nextStep: 'question_5'
  }
},
{
  "id": "question_5",
  "delay": 1500,
  "message": "Como caracterizarias tu humor estas ultimas 2 semanas?",
  "trigger": "question_5_query"
},
{
  "id": "question_5_query",
  "hideInput": true,
  "replace": true,
  "component": 'Query',
  "waitAction": true,
  "metadata": {
    "query": {

      "style": {
      },
      "outputs": {
        "style": {},
        "outputs": [
        ]
      },
      "inputs": {
        "style": "col-6",
        "inputs": [
          {
            "type": "search",
            "style": {},
            "options": {
              "items": ['alegre', 'contento', 'conforme', 'calmo', 'frustrado', 'enojado', 'ansioso', 'depresivo'],
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      }
    }
  },
  "trigger": {
    method: 'triggerSaveData',
    params: 'humor',
    nextStep: 'question_6'
  }
},
{
  "id": "question_6",
  "delay": 1500,
  "message": "Cual dirias que es la causa de este sentimiento?",
  "trigger": "question_6_query"
},
{
  "id": "question_6_query",
  "hideInput": true,
  "replace": true,
  "component": 'Query',
  "waitAction": true,
  "metadata": {
    "query": {

      "style": {
      },
      "outputs": {
        "style": {},
        "outputs": [
          {
            "type": "text",
            "style": {},
            "options": {
              "text": "selecciona cuantas opciones quieras",
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      },
      "inputs": {
        "style": "col-6",
        "inputs": [
          {
            "type": "search",
            "style": {},
            "options": {
              "items": ['trabajo', 'estudio', 'pareja', 'social', 'familia', 'autoestima', 'duelo', 'adiccion', 'LGBT',],
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      }
    }
  },
  "trigger": {
    method: 'triggerSaveData',
    params: 'domain',
    nextStep: 'interlude_1'
  }
},
{
  "id": "interlude_1",
  "delay": 1000,
  "message": "Gracias por responder mis preguntas, se que puede ser dificil. Pero ya diste el primer paso y quizas el mas importante en un camino que transitaremos juntos.",
  "trigger": "interlude_2"
},
{
  "id": "interlude_2",
  "delay": 3000,
  "message": " Estos son los profesionales que creo que pueden ayudarnos.",
  "trigger": {
    method: 'saveQuery',
    params: 'data',
    nextStep: 'choose_professional'
  } 
}
]

export const jsonChatPOL = [{
  "id": "0",
  "component": "Query",
  "metadata": {
    "query": {
      "style": {
      },
      "outputs": {
        "style": {},
        "outputs": [
          {
            "type": "text",
            "style": {},
            "options": {
              "text": "Cual?",
              "option_id": "firebase id for this option",
              "styles": {}
            }
          }
        ]
      },
      "inputs": {
        "style": "col-6",
        "inputs": [
          {
            "type": "camera",
            "style": {},
            "options": {
            }
          }
        ]
      }
    }
  },
  "trigger": {
    method: 'triggerSaveData',
    params: 'diagnostico',
    nextStep: ''
  }
}]


// export const jsonChat = [{
//   "id": "0",
//   "message": "Hola, soy ??MA!",
//   "trigger": "holaUma"
// },
// {
//   "id": "holaUma",
//   "options": [
//     {
//       "value": "Hola ??MA",
//       "label": "Hola ??MA",
//       "trigger": "nombreUser"
//     }
//   ]
// },
// {
//   "id": "nombreUser",
//   "message": "Como te llamas?",
//   "trigger": "nombre"
// },
// {
//   "id": "nombre",
//   "user": true,
//   "trigger": {
//     method: 'triggerSaveData',
//     params: 'nombre',
//     nextStep: 'lindo'
//   }
// },
// {
//   "id": "lindo",
//   "message": "{previousValue}! Que lindo nombre!",
//   "trigger": "edadUser"
// },
// {
//   "id": "edadUser",
//   "message": "Cuantos a??os tienes?",
//   "trigger": "edad"
// },
// {
//   "id": "edad",
//   "user": true,
//   validator: "ageParams",
//   "trigger": {
//     method: 'triggerSaveData',
//     params: 'edad',
//     nextStep: 'presentacion'
//   },
//   "metadata": 'data'
// },
// {
//   "id": "presentacion",
//   "asMessage": true,
//   "component": "#Message@Entonces ${nombre}, Soy UMA tu asistente emocional. Periodicamente te preguntare sobre tu estado de animo, y claro esta,siempre que me necesites, estoy a un click de distancia!",
//   "trigger": "aceptarPresentacion"
// },
// {
//   "id": "presentacionBot",
//   "delay": 2000,
//   "message": "No soy un humano, pero de alguna forma si lo soy!",
//   "trigger": "presentacionProf"
// },
// {
//   "id": "aceptarPresentacion",
//   "options": [
//     {
//       "value": "Ok...",
//       "label": "Ok...",
//       "trigger": "presentacionBot"
//     },
//     {
//       "value": "Genial",
//       "label": "Genial",
//       "trigger": "presentacionBot"
//     }
//   ]
// },
// {
//   "id": "presentacionProf",
//   "delay": 4000,
//   "message": "El primer paso en nuestro viaje es encontrar el profesional mas adecuado para ti",
//   "trigger": "aceptarViaje"
// },
// {
//   "id": "aceptarViaje",
//   "options": [
//     {
//       "value": "Ok!",
//       "label": "Ok!",
//       "trigger": "presentacionPreguntas"
//     }
//   ]
// },
// {
//   "id": "presentacionPreguntas",
//   "delay": 2000,
//   "message": "Pero ahora bien, Hablemos de ti. te voy a hacer unas preguntas solo tomara 3 minutos.",
//   "trigger": "question_1"
// },
// {
//   "id": "question_1",
//   "delay": 2500,
//   "message": "actualmente estas haciendo terapia con un profesional?",
//   "trigger": "question_1_options"
// },
// {
//   "id": "question_1_options",
//   "options": [
//     {
//       "value": "si",
//       "label": "si",
//       "trigger": {
//         method: 'triggerSaveData',
//         params: 'terapia',
//         value: true,
//         nextStep: 'question_2'
//       }
//     },
//     {
//       "value": "no",
//       "label": "no",
//       "trigger": {
//         method: 'triggerSaveData',
//         params: 'terapia',
//         value: false,
//         nextStep: 'question_2'
//       }
//     }
//   ]
// },
// {
//   "id": "question_2",
//   "delay": 1500,
//   "message": "actualmente tienes alguna condicion mental diagnosticada por un profesional?",
//   "trigger": "question_2_options"
// },
// {
//   "id": "question_2_options",
//   "options": [
//     {
//       "value": "si",
//       "label": "si",
//       "trigger": "question_2_which_condition"
//     },
//     {
//       "value": "no",
//       "label": "no",
//       "trigger": {
//         method: 'triggerSaveData',
//         params: 'terapia',
//         value: false,
//         nextStep: 'question_3'
//       }
//     }
//   ]
// },
// {
//   "id": "question_2_which_condition",
//   "hideInput": true,
//   "replace": true,
//   "waitAction": true,
//   "delay": 2500,
//   "hideInput": true,
//   "component": "Query",
//   "metadata": {
//     "query": {
//       "style": {
//       },
//       "outputs": {
//         "style": {},
//         "outputs": [
//           {
//             "type": "text",
//             "style": {},
//             "options": {
//               "text": "Cual?",
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       },
//       "inputs": {
//         "style": "col-6",
//         "inputs": [
//           {
//             "type": "search",
//             "style": {},
//             "options": {
//               "items": ['depresion', 'ansiedad', 'agorafobia', 'psicosis', 'adiccion'],
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       }
//     }
//   },
//   "trigger": {
//     method: 'triggerSaveData',
//     params: 'diagnostico',
//     nextStep: 'question_3'
//   }
// },
// {
//   "id": "question_3",
//   "delay": 1500,
//   "asMessage": true,
//   "component": "#Message@Alguna vez fuiste diagnosticado con una condicion mental por un profesional?",
//   "trigger": "question_3_options"
// },
// {
//   "id": "question_3_options",
//   "options": [
//     {
//       "value": "si",
//       "label": "si",
//       "trigger": "question_3_which_condition"
//     },
//     {
//       "value": "no",
//       "label": "no",
//       "trigger": {
//         method: 'triggerSaveData',
//         params: 'antecedente',
//         value: 'false',
//         nextStep: 'question_4'
//       }
//     }
//   ]
// },
// {
//   "id": "question_3_which_condition",
//   "delay": 1500,
//   "message": "Cual?",
//   "trigger": "question_3_which_condition_input"
// },
// {
//   "id": "question_3_which_condition_input",
//   "hideInput": true,
//   "replace": true,
//   "component": 'Query',
//   "waitAction": true,
//   "metadata": {
//     "query": {

//       "style": {
//       },
//       "outputs": {
//         "style": {},
//         "outputs": [
//         ]
//       },
//       "inputs": {
//         "style": "col-6",
//         "inputs": [
//           {
//             "type": "search",
//             "style": {},
//             "options": {
//               "items": ['depresion', 'ansiedad', 'agorafobia', 'psicosis', 'adiccion'],
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       }
//     }
//   },
//   "trigger": {
//     method: 'triggerSaveData',
//     params: 'antecedente',
//     nextStep: 'question_4'
//   }
// },
// {
//   "id": "question_4",
//   "delay": 1500,
//   "asMessage": true,
//   "component": "#Message@Estas tomando algun tipo de medicacion para una condicion mental?",
//   "trigger": "question_4_options"
// },
// {
//   "id": "question_4_options",
//   "options": [
//     {
//       "value": "si",
//       "label": "si",
//       "trigger": "question_4_which_medication_input"
//     },
//     {
//       "value": "no",
//       "label": "no",
//       "trigger": {
//         method: 'triggerSaveData',
//         params: 'medicacion',
//         nextStep: 'question_5'
//       }
//     }
//   ]
// },
// {
//   "id": "question_4_which_medication_input",
//   "hideInput": true,
//   "replace": true,
//   "component": 'Query',
//   "waitAction": true,
//   "metadata": {
//     "query": {

//       "style": {
//       },
//       "outputs": {
//         "style": {},
//         "outputs": [
//         ]
//       },
//       "inputs": {
//         "style": "col-6",
//         "inputs": [
//           {
//             "type": "search",
//             "style": {},
//             "options": {
//               "items": ['clonazepam', 'rivotril', 'prozac', 'lexapro'],
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       }
//     }
//   },
//   "trigger": {
//     method: 'triggerSaveData',
//     params: 'medicacion',
//     nextStep: 'question_5'
//   }
// },
// {
//   "id": "question_5",
//   "delay": 1500,
//   "message": "Como caracterizarias tu humor estas ultimas 2 semanas?",
//   "trigger": "question_5_query"
// },
// {
//   "id": "question_5_query",
//   "hideInput": true,
//   "replace": true,
//   "component": 'Query',
//   "waitAction": true,
//   "metadata": {
//     "query": {

//       "style": {
//       },
//       "outputs": {
//         "style": {},
//         "outputs": [
//         ]
//       },
//       "inputs": {
//         "style": "col-6",
//         "inputs": [
//           {
//             "type": "search",
//             "style": {},
//             "options": {
//               "items": ['alegre', 'contento', 'conforme', 'calmo', 'frustrado', 'enojado', 'ansioso', 'depresivo'],
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       }
//     }
//   },
//   "trigger": {
//     method: 'triggerSaveData',
//     params: 'humor',
//     nextStep: 'question_6'
//   }
// },
// {
//   "id": "question_6",
//   "delay": 1500,
//   "message": "Cual dirias que es la causa de este sentimiento?",
//   "trigger": "question_6_query"
// },
// {
//   "id": "question_6_query",
//   "hideInput": true,
//   "replace": true,
//   "component": 'Query',
//   "waitAction": true,
//   "metadata": {
//     "query": {

//       "style": {
//       },
//       "outputs": {
//         "style": {},
//         "outputs": [
//           {
//             "type": "text",
//             "style": {},
//             "options": {
//               "text": "selecciona cuantas opciones quieras",
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       },
//       "inputs": {
//         "style": "col-6",
//         "inputs": [
//           {
//             "type": "search",
//             "style": {},
//             "options": {
//               "items": ['trabajo', 'estudio', 'pareja', 'social', 'familia', 'autoestima', 'duelo', 'adiccion', 'LGBT',],
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       }
//     }
//   },
//   "trigger": {
//     method: 'triggerSaveData',
//     params: 'domain',
//     nextStep: 'interlude_1'
//   }
// },
// {
//   "id": "interlude_1",
//   "delay": 1000,
//   "message": "Gracias por responder mis preguntas, se que puede ser dificil. Pero ya diste el primer paso y quizas el mas importante en un camino que transitaremos juntos.",
//   "trigger": "interlude_2"
// },
// {
//   "id": "interlude_2",
//   "delay": 3000,
//   "message": " Estos son los profesionales que creo que pueden ayudarnos.",
//   "trigger": {
//     method: 'saveQuery',
//     params: 'data',
//     nextStep: 'choose_professional'
//   } 
// },
// {
//   "id": "choose_professional",
//   "hideInput": true,
//   "delay": 2000,
//   "replace": true,
//   "component": 'SlidingCards',
//   "waitAction": true,
//   "metadata": {
//     "query": {
//       "style": {
//       },
//       "outputs": {
//         "style": {},
//         "outputs": [
//           {
//             "type": "slidingCard",
//             "style": {},
//             "options": {
//               "text": 'asdsadfdsa',
//               "option_id": "firebase id for this option",
//               "styles": {}
//             }
//           }
//         ]
//       },
//       "inputs": {
//         "style": "col-6",
//         "inputs": [

//         ]
//       }
//     }
//   },
//   "trigger": ""
// }
// ]