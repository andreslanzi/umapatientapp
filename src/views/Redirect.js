import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DBConnection, {firebaseInitializeApp} from "../config/DBConnection";
import Register from "./Register";
import LoginComponent from "../components/User/Login/Login";
// import LoginAnterior from '../components/User/Login'
import Loading from "../components/GeneralComponents/Loading";

const Redirect = props => {
  const [isRegistered, setRegistered] = useState();
  const firestore = DBConnection.firestore(firebaseInitializeApp);
  const { loading } = useSelector(state => state.front);
  const { ws } = props.match.params;
  const dispatch = useDispatch();
  let user = { email: "" };

  const getUser = async () => {
    dispatch({ type: "LOADING", payload: true });
    await firestore
      .doc(`auth/${ws}`)
      .get()
      .then(d => {
        user = d.data();
      });
    // console.log(user);
    dispatch({ type: "FILL_REGISTER", payload: user });
    if (user !== undefined && user !== null) {
      if (
        user.email !== "" &&
        user.email !== undefined &&
        user.email !== null
      ) {
        dispatch({ type: "LOADING", payload: false });
        setRegistered(true);
      } else {
        dispatch({ type: "LOADING", payload: false });
        setRegistered(false);
      }
    } else {
      dispatch({ type: "LOADING", payload: false });
      setRegistered(false);
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  return (
    <div>{loading ? <Loading /> : isRegistered ? <LoginComponent /> : <Register />}</div>
    // <LoginAnterior/>
  );
};
export default Redirect;
