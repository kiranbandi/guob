
import React, { useEffect, useRef, useState } from 'react';
import { Stack } from '@mui/material'
import { IconButton, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { teal, deepOrange } from '@mui/material/colors';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import MultilineChartIcon from '@mui/icons-material/MultilineChart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Slider, { SliderTooltip  } from 'rc-slider';


function TrackControls(props) {
    
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
                <IconButton className='trackButtons' id={"toggleTrackType_" + props.id} sx={{
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
              
              //</Stack>/* <IconButton onClick={handleButtonClick} className='trackButtons'id={"percentageSort" + props.id} sx={{
                    // backgroundColor: deepOrange[100],
                    // borderRadius: 1,
                    // // height: buttonHeight,
                    // '&:hover': {
                    //     backgroundColor: deepOrange[500]
                //     }
                // }}
                // >

                // </IconButton> */}

                      /* { showDiv && ( <div className="sliderContainer " style={{position: 'absolute', 'z-index': 1}}> 
                        <span>
                        {elements}
                        </span>
                        <Button className="sort-button" variant="primary" size="sm" onClick={handleThresholdChange}>
                            Sort
                        </Button>
                    </div>)}
              </> */

                
                :  <IconButton className='trackButtons' id={"pickColor_" + props.id} sx={{
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