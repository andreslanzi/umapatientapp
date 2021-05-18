import React, {useState, useEffect} from 'react'
import Camera from '../../components/GeneralComponents/Camera'
import { useSelector, useDispatch } from 'react-redux';
import { Loader } from '../GeneralComponents/Loading';
import icon from '../../assets/icon.png';
import '../../styles/inputs/picture/PictureComponent.scss';
import { uploadFileToFirebase } from '../Utils/postBlobFirebase';
import './diabetes.scss'
import moment from 'moment'
import axios from "axios"
import { CustomUmaLoader } from '../global/Spinner/Loaders';
import { useHistory } from 'react-router'
import userReducers from '../../store/reducers/userReducers';


const IndexDiabetes = ({step, setStep}) => {
    const [camera, setCamera] = useState('true')
    const { core_id } = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState('');
    const dispatch = useDispatch();
    const history = useHistory()

    const user_test_data = useSelector(state => state.user.diabetic_test)
    const user_test_results = useSelector(state => state.user.diabetic_score)

        useEffect(() => {
        if(user_test_results.probability){
            scoreCalculator()
        }
    }, [user_test_results.probability])
    

    const activateCamera = () => {
        if(camera === 'false' && prediction === ''){
            setCamera('true')
        }
        else if (camera === 'true' && prediction === ''){
            setCamera('false')
        }
        else if(camera === 'false' && prediction !== '' ){
            setCamera('true')
            setPrediction('')
        }
        else{
            console.log('error')
        }}


    const scoreCalculator = () => {
        let calculatedScore = 0
        if (user_test_data.age >= 60 && user_test_data.age < 70) { calculatedScore += 2 }
        if (user_test_data.age >= 70) { calculatedScore += 3 }
        if (user_test_data.sex = "masculino") { calculatedScore += 2 }
        if (user_test_data.smoker = 'si') { calculatedScore += 2 }
        if (user_test_data.diabetic = 'si') { calculatedScore += 3 }
        if (user_test_data.hypertensive = 'si') { calculatedScore += 2 }
        if (user_test_data.medical_record = 'si') { calculatedScore += 1 }
        if (user_test_results.prediction === 'non_diabetic' &&
            user_test_results.probability > 0.5 &&
            user_test_results.probability < 0.75) { calculatedScore += 1 }
        if (user_test_results.prediction === 'non_diabetic' &&
            user_test_results.probability >= 0.75) { calculatedScore += 1 }
        if (user_test_results.prediction === 'diabetic' &&
            user_test_results.probability > 0.5 &&
            user_test_results.probability < 0.75) { calculatedScore += 2 }
        if (user_test_results.prediction === 'diabetic' &&
            user_test_results.probability >= 0.75) { calculatedScore += 3 }

        dispatch({ type: 'DIABETIC_TEST_SCORE_FILL', payload: {probability:user_test_results.probability, score: calculatedScore}  })

    }

    const handleSubmit = async (file) => {

        setLoading(true)

        const date = moment().format('YYYYMMDDHHmm')
        const url = await uploadFileToFirebase(file, `/${core_id}/labs/diabetes_${date}.png`);
        const modelURL = 'https://computer-vision-dot-uma-v2.uc.r.appspot.com/diabetes_predictor'

        let data = {
            bucket_name: "uma-v2.appspot.com",
            blob_path: `${core_id}/labs/diabetes_${date}.png`,
        };

        axios.post(modelURL, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => {
            console.log(res.data)
            if(res.data.prediction === 'non_diabetic'){
                setPrediction('NEGATIVO')
                // setuser.user_test_results.probability((res.data.probability * 100).toFixed())
                dispatch({ type: "DIABETIC_TEST_SCORE_FILL", payload: { probability: (res.data.probability * 100).toFixed(), score: user_test_results.score}})

            }
            else{
                setPrediction('POSITIVO')
                // setuser.user_test_results.probability((1 - res.data.probability * 100).toFixed())
                dispatch({ type: "DIABETIC_TEST_SCORE_FILL", payload: { probability: (1 - res.data.probability * 100).toFixed(), score: user_test_results.score} })

            }})
        scoreCalculator()
        setCamera('false')
		setTimeout(() => setLoading(false), 5000);
    };

    const innerHtmlToRender =
        <div className="picture-container">
            <div className="title">
                <h2>Encuadrate lo más derecho que puedas</h2>
            </div>
        </div>;


    return (
        <>
        {loading ? 
        <>
        <CustomUmaLoader/>
        </>
        :
            camera === 'true'  ? 
            <>
            <Camera 
                        facingMode="user"
                        onTakePhoto={handleSubmit}
                        errorHandler={(e) => console.log(e)}
                        dataType="blob"
                        className="camera"
                        innerHtmlToRender={innerHtmlToRender}
                        style={{height:'70%'}}
                         />
            </>
            :
            user_test_results.probability < 0 ?
            <>
            <div className="testDiabetes__main">
                <img src={icon}></img>
                <h1>No pudimos procesar correctamente tu imagen!</h1>
                <h1>Probamos de nuevo?</h1>
                <div className="testDiabetes__button">
                    <button onClick={activateCamera}>Repetir Test</button>
                    <button onClick={() => history.go(0)}>Volver Al Inicio</button>
                </div>
            </div>
            </>
            :
            <>
            <div className="testDiabetes__main">
                <img src={icon}></img>
                <h1>Tu test dio <span>{prediction}</span></h1>
                <h1>Con un <span>{user_test_results.probability}%</span> de probabilidad</h1>
                <div className="testDiabetes__button">
                    <button onClick={activateCamera}>Repetir Test</button>
                    <button onClick={() => history.go(0)}>Volver Al Inicio</button>
                </div>
            </div>
            </>}
        </>
    )
}

export default IndexDiabetes
