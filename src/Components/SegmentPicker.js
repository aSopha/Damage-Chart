import SegmentPickerButton from "./SegmentPickerButton";
const SegmentPicker = (props) => {
    return (
        <ul className="SegmentList">
            {props.segments.map((segment, index) => {
                if (segment.type) {
                    return <SegmentPickerButton key={index} index={index} segment={segment} onButtonClick={props.onButtonClick} activeSegment={props.activeSegment} setRange={props.setRange}/>
                }
                
            })}
        </ul>
    );
}

export default SegmentPicker