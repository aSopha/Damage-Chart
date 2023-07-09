import { useFilePicker } from 'use-file-picker';
import React from 'react';
import SegmentPicker from './Components/SegmentPicker';
import Chart from './Components/Chart'
import RangeSlider from 'react-range-slider-input';
import { parseEvents } from './Parser.js'
import { segmentLogsByType } from './Segmenter.js'
import { PrecisionPicker } from './Components/PrecisionPicker';
import { PRECISION_MAP } from './Constants';
import './App.css';


let eventsCache = []
let logSegments
function App() {
  const [segmentIndex, setSegmentIndex] = React.useState(0)
  const [range, setRange] = React.useState([0,9999])
  const [precision, setPrecision] = React.useState('high')
  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    onFilesSelected: () => {
      setSegmentIndex(0)
    },
    accept: '.txt',
  });

  if (loading) {
    eventsCache = []
    logSegments = undefined
    return <div className="App">Loading...</div>;
  }
  if (filesContent && filesContent[0]) {
    const allLines = filesContent[0].content
    if(!logSegments) {
      logSegments = segmentLogsByType(allLines, 'arena')
      logSegments = [...logSegments, ...segmentLogsByType(allLines, 'dungeon')]
    }
    const segmentLines = allLines.slice(logSegments[segmentIndex].startIndex, logSegments[segmentIndex].endIndex)
    const logSegment = logSegments[segmentIndex]
    let filterDamageNotDoneToPlayers = logSegment.type === 'arena' ? true : false
    if (!eventsCache[segmentIndex]) {
      eventsCache[segmentIndex] = parseEvents(segmentLines, filterDamageNotDoneToPlayers)
    }
    const { filteredBinnedEvents, players } = eventsCache[segmentIndex]
    
    const binnedDataBySeconds = binFinalizedDataBySeconds(filteredBinnedEvents, PRECISION_MAP[precision])
    const finalizedData = fillInactiveTime(binnedDataBySeconds, players)
    const dataWindow = finalizedData.slice(range[0], range[1])
    return (
      <div className="App">
        <header className="App-header">
        </header>
        <SegmentPicker activeSegment={segmentIndex} segments={logSegments} onButtonClick={setSegmentIndex} setRange={setRange}/>
          <div className="Button">
            <button onClick={() => openFileSelector()}>Select Combat Log </button>
            <br />
          </div>
          <div className="ChartAndSliderWrapper" >
            <PrecisionPicker value={precision} onChange={setPrecision} setRange={setRange}/>
            <Chart data={dataWindow} players={players}/>
            <RangeSlider min={0} max={finalizedData.length} value={range} onInput={setRange}/>
          </div>
      </div>
    );
  }
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <button onClick={() => {openFileSelector()}}>Select Combat Log </button>
          <br />
        </div>
      </header>
    </div>
  );
}

export default App;

const binFinalizedDataBySeconds = (finalizedData, seconds) => {
  if (seconds === 1) {
    return finalizedData
  }
  const result = []
  
  let currentTime = 0;
  let accumulatedDamage = {time: currentTime}
  console.log(finalizedData, seconds)
  for (const timeSlice of finalizedData) {
    if (timeSlice.time > (currentTime + seconds)) {
      result.push(accumulatedDamage)
      currentTime += seconds
      accumulatedDamage = {time: currentTime}
    }
    if(timeSlice.time < (currentTime + seconds)) {
      for (const player in timeSlice) {
        if (player === 'time') {
          accumulatedDamage.time = currentTime
        } else {
          if (!accumulatedDamage[player]) {
            accumulatedDamage[player] = Math.floor(timeSlice[player]/seconds)
          } else {
            accumulatedDamage[player] += Math.floor(timeSlice[player]/seconds)
          }
        }
      } 
    }
  }
  console.log(result, 'result')
  return result
}

const fillInactiveTime = (binnedPlayerEvents, players) => {
  const playerNames = getPlayerNamesFromPlayersList(players)
  
  const filledEvents = binnedPlayerEvents.map((binnedEvent) => {
    const filledEvent = {...binnedEvent}
    for (const playerName of playerNames) {
      if(!binnedEvent[playerName]) {
        filledEvent[playerName] = 0
      }
    }
    return filledEvent
  })
  console.log(filledEvents)
  return filledEvents
}

const getPlayerNamesFromPlayersList = (players) => {
  const playerNames = []
  const playerIterator = players.values();
  for (let i = 0; i < players.size; i++) {
    playerNames.push(playerIterator.next().value.name)
  }
  return playerNames
}


