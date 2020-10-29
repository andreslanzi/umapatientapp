import React, { useState } from 'react';
import { GenericHeader } from '../GeneralComponents/Headers';
import GoogleMapReact from 'google-map-react';
import { mapConfig, handleApiLoaded } from '../Utils/mapsApiHandlers';
import DBConnection from '../../config/DBConnection';
import '../../styles/hisopado/coverage.scss';

const HisopadosCoverage = () => {
    const [userLocation, setUserLocation] = useState({ lng: 0, lat: 0 });
    const firestore = DBConnection.firestore();

    const onGoogleApiLoaded = async (map, maps) => {
        let coords = [];

        const coordsRef = firestore.collection('parametros').doc('userapp').collection('delivery').doc('hisopados')
        const allCoords = await coordsRef.get();
        
        if(allCoords.exists) {
            allCoords.data().zones.caba.map(coord => {
                let coordToNumber = {
                    lat: Number(coord.lat),
                    lng: Number(coord.lng)
                }
                coords.push(coordToNumber);
            })
        }

        handleApiLoaded(setUserLocation);
      
        let coverage = new maps.Polygon({
          paths: coords,
          // strokeColor: "#0A6DD7",
          strokeColor: "#009042",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          // fillColor: "#0A6DD7",
          fillColor: "#009042",
          fillOpacity: 0.35
        });
        coverage.setMap(map);
      };
    
    return (
        <div className="coverage__container">
            <GenericHeader children="Hisopado" />
            <div className="coverage__map">
                <GoogleMapReact 
                    {...mapConfig({lat: userLocation.lat, lng: userLocation.lng })}
                    onGoogleApiLoaded={({ map, maps }) => onGoogleApiLoaded(map, maps)}
                />
                <article className="coverage__card">
                    <h2 className="coverage__cardTitle">Áreas de cobertura</h2>
                    <ul className="coverage__cardList">
                        <li className="coverage__cardItem coverage__cardItem-con">
                            <span></span>
                            Con cobertura
                        </li>
                        <li className="coverage__cardItem coverage__cardItem-sin">
                            <span></span>
                            Sin cobertura
                        </li>
                    </ul>
                </article>
            </div>
        </div>
    )    
}

export default HisopadosCoverage;