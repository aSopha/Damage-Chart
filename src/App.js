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
import { formatSeconds } from './util';

function App() {
  const [segmentIndex, setSegmentIndex] = React.useState(0)
  const [range, setRange] = React.useState([0,9999])
  const [precision, setPrecision] = React.useState('high')
  const [useStub, setUseStub] = React.useState(false)
  const [stub, setStub] = React.useState('')
  const [eventsCache, setEventsCache] = React.useState([])
  const [logSegments, setLogSegments] = React.useState()
  const [loadingStub, setLoadingStub] = React.useState(false)
  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    onFilesSelected: (data) => {
      setUseStub(false)
      if(data.filesContent[0]) {
        handleNewLog(data.filesContent[0].content)
      }
    },
    accept: '.txt',
  });

  const loadStub = async () => {
    if(useStub) {
      return
    }
    if(!stub) {
      setLoadingStub(true)
      const res = await fetch('/Damage-Chart/StubLog.txt')
      const data = await res.text()
      setStub(data)
      setLoadingStub(false)
      handleNewLog(data)
    } else {
      await handleNewLog(stub)
    }
    setUseStub(true)
  }
  const handleSegmentChange = (sIndex) => {
    const rawText = stub ? stub : filesContent[0].content
    if (!eventsCache[sIndex]) {
      const segments = [...segmentLogsByType(rawText, 'arena'), ...segmentLogsByType(rawText, 'dungeon')]
      const segmentLines = stub.slice(segments[sIndex].startIndex, segments[sIndex].endIndex)
      const logSegment = segments[sIndex]
      const filterDamageNotDoneToPlayers = logSegment.type === 'arena' ? true : false
      eventsCache[sIndex] = parseEvents(segmentLines, filterDamageNotDoneToPlayers)
      setEventsCache([...eventsCache])
    }
    setSegmentIndex(sIndex)
  }

  const handleNewLog = (rawText) => {
    setSegmentIndex(0)
    setEventsCache([])
    const segments = [...segmentLogsByType(rawText, 'arena'), ...segmentLogsByType(rawText, 'dungeon')]
      const segmentLines = rawText.slice(segments[segmentIndex].startIndex, segments[segmentIndex].endIndex)
      const logSegment = segments[segmentIndex]
      const filterDamageNotDoneToPlayers = logSegment.type === 'arena' ? true : false
      const newEventsCache = []
      if (!newEventsCache[segmentIndex]) {
        eventsCache[segmentIndex] = parseEvents(segmentLines, filterDamageNotDoneToPlayers)
        setEventsCache([...eventsCache])
      }
    setLogSegments(segments)
  }

  
  if (loading || loadingStub) {
    return <div className="App">Loading...</div>;
  }
  if (eventsCache[segmentIndex] && logSegments) {
    const { filteredBinnedEvents, players } = eventsCache[segmentIndex]
    
    const binnedDataBySeconds = binFinalizedDataBySeconds(filteredBinnedEvents, PRECISION_MAP[precision])
    const finalizedData = fillInactiveTime(binnedDataBySeconds, players)
    const dataWindow = finalizedData.slice(range[0], range[1])
    return (
      <div className="App">
        <header className="App-header">
        </header>
        <SegmentPicker activeSegment={segmentIndex} segments={logSegments} onButtonClick={handleSegmentChange} setRange={setRange}/>
          <div className="Button">
            <button onClick={() => openFileSelector()}>Select Combat Log </button>
            <button onClick={() => loadStub()}> Try Example Data! </button>
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
          <button onClick={() => loadStub()}> Try Example Data! </button>
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
  for (const timeSlice of finalizedData) {
    if (timeSlice.time > (currentTime + seconds)) {
      result.push(accumulatedDamage)
      currentTime += seconds
      const formattedTime = formatSeconds(currentTime)
      accumulatedDamage = {time: currentTime, formattedTime}
    }
    if(timeSlice.time < (currentTime + seconds)) {
      for (const player in timeSlice) {
        if (player === 'time') {
          accumulatedDamage.time = currentTime
          accumulatedDamage.formattedTime = formatSeconds(currentTime)
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


