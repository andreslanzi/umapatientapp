
import React from 'react';
import { useDispatch } from 'react-redux';
import { MdClose } from 'react-icons/md'
import '../../../styles/modal.scss';

const MobileModal = (props) => {
  const dispatch = useDispatch()
  return (
    <div className="modalContainer">
      <div className="modal-back"></div>
      <div className={`mobile-modal ${props.noScroll? "no-scroll": ""} ${props.surveyHisopados ? 'hisopados' : ''} ${props.isWellness ? 'isWellness' : ''}`}>
        {props.hideCloseButton ? '' :
          <div className="modal-close" onClick={() => {
            if (props.callback) {
              props.callback();
            } else {
              dispatch({ type: 'TOGGLE_DETAIL', payload: false });
            }
          }}>
            <MdClose />
          </div>
        }
        {
          props.hideTitle ? '' : 
          <div className="modalTitle">{props.title}</div>
        }
        <div className="modalContent">{props.children}</div>
      </div>
    </div>
  )
}

export default MobileModal;
