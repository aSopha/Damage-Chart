const SegmentPickerButton = (props) => {
    const className = props.activeSegment === props.index ? "SegmentButton Active" : "SegmentButton"
    const onButtonClick = () => {
        props.onButtonClick(props.index)
        props.setRange([0, 999999])
    }
    return (
        <div className="SegmentButtonWrapper">
            <li className={className} onClick={() => onButtonClick()} >#{props.index+1}-{props.segment.type}</li>
        </div>
    );
}

export default SegmentPickerButton