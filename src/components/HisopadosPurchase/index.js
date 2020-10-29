import React, { useState, useEffect } from 'react';
import { GenericHeader } from '../GeneralComponents/Headers';
import AskForBuyHisopado from "./Components/AskForBuyHisopado";
import AddressPickerHisopado from "./Components/AddressPickerHisopado";
import ZoneCoveredHisopado from "./Components/ZoneCoveredHisopado";
import EndAssignationHisopado from "./Components/EndAssignationHisopado";
import Payment from "../Payment";
import "./hisopadosFlux.scss";

export default function HisopadosPurchase() {
    const [fluxTrackerHisopado, setFluxTrackerHisopado] = useState("END_ASSIGNATION");

    const renderContent = () => {
        switch (fluxTrackerHisopado) {
            case "ASK_FOR_BUY":
                return <AskForBuyHisopado 
                finalAction = {() => setFluxTrackerHisopado("ADDRESS_PICKER")}/>
            case "ADDRESS_PICKER":
                return <AddressPickerHisopado 
                finalAction = {() => setFluxTrackerHisopado("ZONE_COVERED")}/>
            case "ZONE_COVERED":
                return <ZoneCoveredHisopado 
                finalAction = {() => setFluxTrackerHisopado("PAYMENT")}/>
            case "PAYMENT":
                return <Payment 
                finalAction = {() => setFluxTrackerHisopado("END_ASSIGNATION")}/>
            case "END_ASSIGNATION":
                return <EndAssignationHisopado />
            default: 
                console.log("ALGO")
    }}

    return (
        <div className={`hisopados-flux ${(fluxTrackerHisopado === "ADDRESS_PICKER" )? "no-scroll-container": ""}`}>
          <GenericHeader children="Hisopado" />
          {renderContent()}
        </div>
    )
}
