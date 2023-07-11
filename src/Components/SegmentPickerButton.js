const SegmentPickerButton = (props) => {
    const className = props.activeSegment === props.index ? "SegmentButton Active" : "SegmentButton"
    const onButtonClick = () => {
        props.onButtonClick(props.index)
        props.setRange([0, 999999])
    }
    return (
        <li className={className + ` ${props.segment.type}`} onClick={() => onButtonClick()} >#{props.index+1}-{props.segment.type}</li>
    );
}

export default SegmentPickerButton