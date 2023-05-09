
import React, { useEffect, useRef, useState } from 'react';
import { Stack } from '@mui/material'
import { IconButton, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { teal, deepOrange } from '@mui/material/colors';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import MultilineChartIcon from '@mui/icons-material/MultilineChart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Slider, { SliderTooltip  } from 'rc-slider';
import Select from 'react-select';



function TrackControls(props) {
    

    const trackType = props.trackType;
    const repeatOptions = props.repeatOptions;
    const handleRepeatSelection = props.handleRepeatSelection;



    const customStyles = {
        // menu: (provided, state) => ({
        //     ...provided,
        //   })
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
              ...styles,
              backgroundColor: 'white' ,
              color: data.color,

            //   zIndex: 9999

            //   width: 200
            };
          }
      };

      const extraStyles = {
        control: (provided, state) => ({
          ...provided,
          padding: 0
        }),
        input: (provided, state) => ({
          ...provided,
          margin: 0,
          padding: 0
        }),
        menu: (provided, state) => ({
          ...provided,
          marginTop: 0,
          paddingTop: 0
        }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
              ...styles,
              backgroundColor: 'white' ,
              color: data.color,

            //   zIndex: 9999

            //   width: 200
            };
          }

      };
      


    // const buttonHeight = props.height/3
    const renderTrack = props.renderTrack;
    let subGenomes = "N/A";

    if (renderTrack=="stackedTrack"){
        
        subGenomes = props.subGenomes;
        const [selectedSG, setSelectedSG] = props.activeSubGenome;}

    
    const [showDiv, setShowDiv] = useState(false);

    // const handleButtonClick = () => {
    //     console.log("SKRR")
    //   setShowDiv(true);
    // };
  
    // const handleDivClose = () => {
    //   setShowDiv(false);
    // };
  
    const handleSelectChange = (event) => {
        props.updateActiveSubgenome(event.target.value);
    };

    // let localSGValues= {};


    // const { Handle } = Slider;

    // const handle = props => {
    //     const { value, dragging, index, ...restProps } = props;
    //     return (
    //       <SliderTooltip
    //         prefixCls="rc-slider-tooltip"
    //         overlay={`${value} %`}
    //         visible={dragging}
    //         placement="top"
    //         key={index}
    //       >
    //         <Handle value={value} {...restProps} />
    //       </SliderTooltip>
    //     );
    //   };

    // const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

    // const changeSG = (className, value)=>{



    //     let SG= className;

    //     let valuesAll = localSGValues;
    //     // this.setState(prevState => ({
    //     //     localSGValues:{
    //     //         ...prevState.localSGValues,
    //     //         [SG]: value
    //     //     }
    //     //     }));
    //     valuesAll[SG] = value;
    //     let totalSGVal = sumValues(valuesAll);


    //     if (totalSGVal>100){
    //         let newvalue = value  - (totalSGVal - 100);

    //         localSGValues[SG] = newvalue;
    //         // this.setState(prevState => ({
    //         //     localSGValues:{
    //         //         ...prevState.localSGValues,
    //         //         [SG]: newvalue
    //         //     }
    //         //     }));
            
    //     }else{
    //         localSGValues[SG] = value;
    //         // this.setState(prevState => ({
    //         //     localSGValues:{
    //         //         ...prevState.localSGValues,
    //         //         [SG]: value
    //         //     }
    //         //     }));
    //     }


    // }

    // const handleThresholdChange = ()=>{
    //     handleDivClose();
    //     let SubGenomeThreshold = localSGValues;

    //     props.updateSGThreshold(SubGenomeThreshold)
    // }

    // let elements = [];
  
    // for (let i = 0; i < subGenomes.length; i++) {
    //     elements.push(<div key={i} className='inner-span-text' id={"SEEE"+i}>
    //     <b className="percent-subgenome-text" >{subGenomes[i]}</b>
    //     <Slider className={subGenomes[i]} key={i} id={subGenomes[i]+"sortingPercent"}  min={0} max={100} defaultValue={0} value={localSGValues[subGenomes[i]]}  handle={handle} 
    //     onChange={(value) => {
    //         changeSG(subGenomes[i], value);
    //       }}/>
    //     </div>)
    //     }

  

    return (
        <Stack marginTop={-props.gap+ "px"} marginBottom={ "0px"} alignItems={"flex-end"} style={{float: "right"}}>

            {trackType ===  "repeats"
            ?  <span style = {{
                'position': 'absolute',
                top: 0,
                right: 0,
                height: 10,
                display: 'flex',
                'align-items': 'center',
            //    zIndex: 9999,

                'transform-origin': 'top right', display: 'flow-root'}} > <Select   onChange={handleRepeatSelection}

                            // value={chosenRepeats}
                            options={repeatOptions}
                            styles={extraStyles}

                            isMulti
                            /> </span>

            :    <IconButton className='trackButtons' id={"toggleTrackType_" + props.id} sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    // height: buttonHeight,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }}
                >
                    <MultilineChartIcon fontSize="small" className="handle_image" />
                </IconButton>
}
                <IconButton className='trackButtons'id={"deleteTrack_" + props.id} sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    // height: buttonHeight,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }}
                >
                    <RemoveCircleOutlineIcon fontSize="small" className="handle_image" />
                </IconButton>
               

                {renderTrack  === "stackedTrack"
                ? <select id="selectOption" onChange={handleSelectChange}>
                <option value="">-</option>
                {subGenomes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
                


                    
                :    <IconButton className='trackButtons' id={"pickColor_" + props.id} sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    // height: buttonHeight,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }}>
                    <ColorLensIcon fontSize="small" className="handle_image" />
                </IconButton>
                }



        </Stack>
    )
}

export default TrackControls